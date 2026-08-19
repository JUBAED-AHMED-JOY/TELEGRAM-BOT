const fs = require('fs-extra');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

// FFmpeg পাথ সেট করা
ffmpeg.setFfmpegPath(ffmpegStatic);

module.exports = {
    config: {
        name: 'mp3',
        author: 'JOY AHMED',
        aliases: ['toaudio', 'audio', 'convertmp3'],
        role: 0, // সবাই ব্যবহার করতে পারবে
        cooldown: 5,
        description: 'Convert video or video note to MP3 audio',
        usePrefix: true
    },

    async onStart({ bot, chatId, msg }) {
        const messageId = msg ? msg.message_id : undefined;

        // ১. চেক করা মেসেজটি কোনো ভিডিওর রিপ্লাই কিনা
        const replyMsg = msg.reply_to_message;
        if (!replyMsg || (!replyMsg.video && !replyMsg.video_note && !replyMsg.document)) {
            return bot.sendMessage(chatId, "⚠️ **যেকোনো ভিডিওর রিপ্লাইয়ে `/mp3` লিখুন!**", {
                reply_to_message_id: messageId,
                parse_mode: 'Markdown'
            });
        }

        // ফাইল অবজেক্ট নির্বাচন (ভিডিও, ভিডিও নোট বা ডকুমেন্ট আকারে পাঠানো ভিডিও)
        const mediaObj = replyMsg.video || replyMsg.video_note || (replyMsg.document && replyMsg.document.mime_type?.includes('video') ? replyMsg.document : null);

        if (!mediaObj) {
            return bot.sendMessage(chatId, "❌ শুধুমাত্র ভিডিও ফাইলকে অডিওতে কনভার্ট করা সম্ভব!", {
                reply_to_message_id: messageId
            });
        }

        const processingMsg = await bot.sendMessage(chatId, "⏳ **ভিডিও থেকে অডিও জেনারেট করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...**", {
            reply_to_message_id: messageId,
            parse_mode: 'Markdown'
        });

        const timeStamp = Date.now();
        const inputFilePath = path.join(__dirname, `temp_input_${timeStamp}.mp4`);
        const outputFilePath = path.join(__dirname, `temp_output_${timeStamp}.mp3`);

        try {
            // ২. টেলিগ্রাম থেকে ভিডিও ডাউনলোড লিংক বের করা
            const file = await bot.getFile(mediaObj.file_id);
            const downloadUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

            // ৩. ভিডিও ফাইল সার্ভারে ডাউনলোড
            const response = await require('axios')({
                method: 'get',
                url: downloadUrl,
                responseType: 'stream'
            });

            const writer = fs.createWriteStream(inputFilePath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // ৪. FFmpeg দিয়ে ভিডিও থেকে অডিও (MP3) কনভার্ট করা
            await new Promise((resolve, reject) => {
                ffmpeg(inputFilePath)
                    .toFormat('mp3')
                    .audioBitrate(192)
                    .on('end', resolve)
                    .on('error', reject)
                    .save(outputFilePath);
            });

            // ৫. কনভার্ট করা MP3 সেন্ড করা
            const audioCaption = 
`⚡ ━━━ ❪ 𝗠𝗣𝟯 𝗖𝗢𝗡𝗩𝗘𝗥𝗧𝗘𝗗 ❫ ━━━ ⚡

╭───────────❍
│ ✅ **Status:** Audio Successfully Extracted!
╰───────────❍

✨ 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 𝗝𝗢𝗬 𝗔𝗛𝗠𝗘𝗗 ✨`;

            await bot.sendAudio(chatId, outputFilePath, {
                caption: audioCaption,
                reply_to_message_id: messageId,
                parse_mode: 'Markdown'
            });

            // প্রসেসিং মেসেজ মুছে ফেলা
            await bot.deleteMessage(chatId, processingMsg.message_id).catch(() => {});

        } catch (error) {
            console.error("MP3 Command Error:", error.message);
            bot.sendMessage(chatId, "❌ ভিডিও থেকে অডিও বের করতে ব্যর্থ হয়েছে!", {
                reply_to_message_id: messageId
            });
        } finally {
            // ক্যাশ বা টেম্পোরারি ফাইলগুলো ক্লিনআপ/ডিলেট করা
            if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
            if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
        }
    }
};
