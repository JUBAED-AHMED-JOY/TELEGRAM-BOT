/* ============================================================
   RNDM COMMAND — JOY Random Video API theke video dibe
   File: JOY-CMDS/cmds/rndm.js
   - /rndm joy    -> 'joy' name er video + sob count
     (oi name e koita video, total koita name, total koita video)
   - khali /rndm  -> video dibe NA, usage dekhabe
   - Video LINK hisebe pathano hoy NA — bot nije video
     download kore stream hisebe sendVideo korbe (Telegram
     link theke download korte na parle 400 error dito)
   - videos.json e viewer link (joy-upload-api /v/...) thakle
     viewer page theke asol video ber kore download korbe
   ============================================================ */

const axios = require("axios");
const { Readable } = require("stream");

const API_BASE = "https://joy-random-api-40-seven.vercel.app";

function extFrom(url) {
    const clean = url.split("?")[0].split("#")[0];
    const last = clean.split("/").pop() || "";
    const ext = (last.split(".").pop() || "").toLowerCase();
    return /^[a-z0-9]{2,5}$/.test(ext) ? ext : "mp4";
}

function mimeForExt(ext) {
    if (ext === "webm") return "video/webm";
    if (ext === "mov") return "video/quicktime";
    if (ext === "mkv") return "video/x-matroska";
    if (ext === "avi") return "video/x-msvideo";
    return "video/mp4";
}

module.exports = {
    config: {
        name: "rndm",
        role: 0,
        cooldown: 5,
        description: "Random API theke name diye video dibe",
        usePrefix: true,
        author: "JOY"
    },

    async onStart({ bot, chatId, msg, args }) {
        const messageId = msg ? msg.message_id : undefined;
        const name = args && args.length > 0 ? args.join(" ") : "";
        // Name na dile video dibe na — usage dekhabe
        if (!name) {
            return bot.sendMessage(chatId, "❌ Video er name dao!\nUsage: /rndm <name>\nExample: /rndm joy", { reply_to_message_id: messageId });
        }
        const apiUrl = `${API_BASE}/api/video?name=${encodeURIComponent(name)}`;
        try {
            const res = await axios.get(apiUrl, { validateStatus: () => true });
            const data = res.data || {};
            if (res.status !== 200 || !data.url) {
                return bot.sendMessage(chatId, "❌ Video pai nai: " + name, { reply_to_message_id: messageId });
            }

            // Count lines: sob count — oi name e koita, total koita name, total koita video
            const countInfo = [];
            if (typeof data.count === 'number') countInfo.push(`📊 Ei name e video: ${data.count} ta`);
            if (typeof data.totalVideos === 'number') countInfo.push(`📈 Total video: ${data.totalVideos} ta`);
            if (typeof data.total === 'number') countInfo.push(`📁 Total name: ${data.total} ta`);
            const countText = countInfo.length ? '\n' + countInfo.join('\n') : '';

            let videoUrl = data.url;
            // Viewer link hole viewer page theke asol video URL ber koro
            if (/joy-upload-api\.vercel\.app\/v\//i.test(videoUrl)) {
                try {
                    const pageRes = await axios.get(videoUrl, { validateStatus: () => true });
                    const html = typeof pageRes.data === "string" ? pageRes.data : "";
                    const m = html.match(/https:\/\/api\.telegram\.org\/file\/bot[^\s"'<>]+/);
                    if (m) {
                        videoUrl = m[0];
                    } else {
                        // Resolve na hole link hisebe pathao (user click kore dekhbe)
                        return bot.sendMessage(chatId, `🎬 ${data.name}${countText}\n🔗 ${data.url}`, { reply_to_message_id: messageId });
                    }
                } catch (_) {
                    return bot.sendMessage(chatId, `🎬 ${data.name}${countText}\n🔗 ${data.url}`, { reply_to_message_id: messageId });
                }
            }

            // Bot nije video download kore stream hisebe pathabe (link na)
            const dl = await axios.get(videoUrl, { responseType: "arraybuffer", validateStatus: () => true });
            if (dl.status !== 200 || !dl.data || !dl.data.byteLength) {
                return bot.sendMessage(chatId, "❌ Video download hoy nai — source link kaj kortese na.", { reply_to_message_id: messageId });
            }
            const ext = extFrom(videoUrl);
            const stream = Readable.from(Buffer.from(dl.data));
            return bot.sendVideo(chatId, stream, {
                caption: `🎬 ${data.name}${countText}`,
                reply_to_message_id: messageId
            }, {
                filename: `video.${ext}`,
                contentType: mimeForExt(ext)
            });
        } catch (e) {
            console.error("Rndm error:", e.message);
            return bot.sendMessage(chatId, "❌ Video ante pari nai, abar try koro.", { reply_to_message_id: messageId });
        }
    }
};
