/* ============================================================
   AUTO VIDEO + AUDIO DOWNLOAD EVENT v3 (JOY AHMED)
   File: JOY-CMDS/events/auto.js (ager file er bodole bosbe)

   Flow (user ja chaise):
     1. Link pathale video AUTO download hoye chole asbe
        (ager moto, age kono choice button na).
     2. Oi video message er nichei 4 ta button thakbe:
        📋 Copy Title | 🤖 BOT OWNER | 🎬 Video | 🎵 Audio
     3. 🎬 Video button e click korle video ta abar asbe.
        🎵 Audio button e click korle mp3 audio asbe.
        (Audio: video download kore ffmpeg diye mp3 banano hoy,
        tai FB/TikTok/IG/YT — sob link ei audio kaj korbe.)

   Button click bot er nijer callback system diye handle hoy
   (bot.on('callback_query')) — framework er globalHandleButton
   er upor nirvor kore na, tai event e sob somoy kaj korbe.
   Video file 30 min cache e thake, tai button click e abar
   download kora lage na (30 min por auto delete).
   Jodi kono karone bot.on na thake, tahole ager moto sudhu
   video + Copy Title + Owner button asbe (fallback).
   ============================================================ */

const fs = require('fs');
const { downloadVideo } = require('joy-video-downloader');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);

// Pending download (memory te thake, 30 min meyad)
// id -> { url, videoPath, videoTitle, chatId, replyToId, createdAt }
const pending = {};
let callbackReady = false;

function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function cleanupPending() {
    const now = Date.now();
    for (const k of Object.keys(pending)) {
        if (now - pending[k].createdAt > 30 * 60 * 1000) {
            safeUnlink(pending[k].videoPath);
            delete pending[k];
        }
    }
}

function safeDelete(bot, chatId, messageId) {
    if (!messageId) return Promise.resolve();
    return bot.deleteMessage(chatId, messageId).catch(() => {});
}

function safeUnlink(filePath) {
    try {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) { /* ignore */ }
}

// Video file theke mp3 audio banano
function videoToAudio(videoPath) {
    const audioPath = videoPath.replace(/\.[^.]+$/, '') + '.mp3';
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .noVideo()
            .audioCodec('libmp3lame')
            .audioBitrate('128k')
            .format('mp3')
            .on('end', () => resolve(audioPath))
            .on('error', reject)
            .save(audioPath);
    });
}

// File message er caption + button
// dlId thakle Video/Audio download button o thakbe
function fileOptions(videoTitle, replyToId, dlId) {
    const keyboard = [
        [{ text: '📋 Copy Title', copy_text: { text: videoTitle } }],
        [{ text: '🤖 BOT OWNER: JOY AHMED', url: 'https://t.me/JOY_AHMED_88' }]
    ];
    if (dlId) {
        keyboard.push([
            { text: '🎬 Video', callback_data: 'dl_video_' + dlId },
            { text: '🎵 Audio', callback_data: 'dl_audio_' + dlId }
        ]);
    }
    return {
        caption: `🎬 𝗧𝗶𝘁𝗹𝗲: ${videoTitle}\n\n🌿 ★ 𝗝𝗢𝗬-𝗧𝗚-𝗕𝗢𝗧 ★\n𝗕𝗢𝗧 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 𝗝𝗢𝗬 𝗔𝗛𝗠𝗘𝗗`,
        reply_to_message_id: replyToId,
        reply_markup: { inline_keyboard: keyboard }
    };
}

// Button click korle download + send (bot er callback_query theke ase)
async function onCallbackQuery(bot, query) {
    const data = query.data || '';
    const m = data.match(/^dl_(video|audio)_(.+)$/);
    if (!m) return; // Amader button na, onno command er button

    const kind = m[1];
    const pid = m[2];
    const job = pending[pid];
    const chatId = job ? job.chatId : (query.message ? query.message.chat.id : null);
    if (!chatId) return;

    // Button er loading spinner sorano
    if (bot.answerCallbackQuery) {
        await bot.answerCallbackQuery(query.id).catch(() => {});
    }

    if (!job) {
        return bot.sendMessage(
            chatId,
            '⚠️ Ei button er meyad sesh! Link ta abar pathao.'
        ).catch(() => {});
    }

    const waitMsg = await bot.sendMessage(
        chatId,
        kind === 'video' ? '⏳ 𝗩𝗶𝗱𝗲𝗼 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗶𝗻𝗴...' : '⏳ 𝗔𝘂𝗱𝗶𝗼 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗶𝗻𝗴...'
    ).catch(() => null);

    let audioPath = null;

    try {
        // Cache e video thakle oitai use hobe, na thakle abar download
        let vPath = job.videoPath;
        if (!vPath || !fs.existsSync(vPath)) {
            const dl = await downloadVideo(job.url);
            vPath = dl.filePath;
            job.videoPath = vPath;
            job.videoTitle = dl.title || job.videoTitle;
        }

        if (kind === 'video') {
            await bot.sendVideo(
                chatId,
                fs.createReadStream(vPath),
                fileOptions(job.videoTitle, job.replyToId, pid)
            );
        } else {
            audioPath = await videoToAudio(vPath);
            await bot.sendAudio(
                chatId,
                fs.createReadStream(audioPath),
                fileOptions(job.videoTitle, job.replyToId, pid)
            );
        }

        await safeDelete(bot, chatId, waitMsg ? waitMsg.message_id : null);
        // Video cache rakha holo (30 min) jate abar click kora jay

    } catch (err) {
        console.error('Download error:', err.message);
        await safeDelete(bot, chatId, waitMsg ? waitMsg.message_id : null);
        await bot.sendMessage(
            chatId,
            '❌ Download kora jay nai! Link ta check kore abar try koro.'
        ).catch(() => {});
    } finally {
        safeUnlink(audioPath); // mp3 temp file delete, video cache thakbe
    }
}

module.exports = {
    config: {
        name: 'autovideo',
        description: 'Auto download video from link + Video/Audio download buttons',
        prefix: false, // Event based
        role: 0
    },

    handleEvent: async function ({ event, api, bot }) {
        const msg = event.msg;
        if (!msg || !msg.text) return;

        const chatId = msg.chat.id;
        const text = msg.text.trim();
        const urlMatch = text.match(/https?:\/\/[^\s]+/);
        if (!urlMatch) return;

        const url = urlMatch[0];
        cleanupPending();

        // Callback listener ekbar register (bot er nijer system)
        const hasCallback = bot && typeof bot.on === 'function';
        if (hasCallback && !callbackReady) {
            callbackReady = true;
            bot.on('callback_query', (query) => onCallbackQuery(bot, query));
        }

        const dlId = hasCallback ? newId() : null;

        let waitMsg = null;
        try {
            waitMsg = await bot.sendMessage(chatId, '⏳ 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁, 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗶𝗻𝗴 𝘃𝗶𝗱𝗲𝗼...', {
                reply_to_message_id: msg.message_id
            });

            const { title, filePath } = await downloadVideo(url);
            const videoTitle = title || 'No Title';

            // Video AUTO send + sathe 4 ta button (callback thakle)
            await bot.sendVideo(
                chatId,
                fs.createReadStream(filePath),
                fileOptions(videoTitle, msg.message_id, dlId)
            );

            await safeDelete(bot, chatId, waitMsg.message_id);

            if (dlId) {
                // Video cache e rakha holo jate button click e kaj kore
                pending[dlId] = {
                    url: url,
                    videoPath: filePath,
                    videoTitle: videoTitle,
                    chatId: chatId,
                    replyToId: msg.message_id,
                    createdAt: Date.now()
                };
            } else {
                safeUnlink(filePath); // Fallback: button nai, tai file delete
            }

        } catch (err) {
            console.error('Video download error:', err.message);
            await safeDelete(bot, chatId, waitMsg ? waitMsg.message_id : null);
            await bot.sendMessage(
                chatId,
                '❌ Download kora jay nai! Link ta check kore abar try koro.'
            ).catch(() => {});
        }
    }
};
