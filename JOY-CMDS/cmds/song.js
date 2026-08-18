const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs-extra");
const path = require("path");
const { downloadVideo } = require("joy-video-downloader");

module.exports = {
  config: {
    author: "JOY AHMED",
    name: "song",
    aliases: [],
    usePrefix: true,
    role: 0,
    cooldown: 5,
    description: "Download MP3 using joy-video-downloader"
  },

  onStart: async function ({ bot, chatId, msg, args }) {
    const messageId = msg ? msg.message_id : undefined;

    if (!args.length) {
      return bot.sendMessage(chatId, "⚠️ গানের নাম অথবা ইউটিউব লিঙ্ক দাও।", {
        reply_to_message_id: messageId
      });
    }

    let query = args.join(" ");
    let ytLink = query;

    try {
      // 🔍 YouTube search
      if (!ytLink.includes("youtu")) {
        const search = await yts(query);
        if (!search.videos.length) {
          return bot.sendMessage(chatId, "❌ গানটি খুঁজে পাওয়া যায়নি।", {
            reply_to_message_id: messageId
          });
        }
        ytLink = search.videos[0].url;
      }

      // ⏳ loading message
      const loadingMsg = await bot.sendMessage(chatId, "⏳ গানটি প্রসেসিং হচ্ছে...", {
        reply_to_message_id: messageId
      });

      // 📁 cache folder
      const cacheDir = path.resolve(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const filePath = path.join(cacheDir, `song_${Date.now()}.mp3`);

      // 🎵 download
      const data = await downloadVideo(ytLink, filePath);

      if (!data || !data.filePath) {
        await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
        return bot.sendMessage(chatId, "❌ গানটি ডাউনলোড করা সম্ভব হয়নি!", {
          reply_to_message_id: messageId
        });
      }

      const title = data.title || "Unknown Title";

      // 🧹 remove loading msg
      await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});

      // 🎧 send audio
      await bot.sendAudio(chatId, fs.createReadStream(data.filePath), {
        caption: `🎵 𝗧𝗶𝘁𝗹𝗲: ${title}\n✅ 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲!`,
        reply_to_message_id: messageId
      });

      // 🗑️ delete file safely after send
      if (fs.existsSync(data.filePath)) {
        fs.unlinkSync(data.filePath);
      }

    } catch (error) {
      console.error("SONG ERROR:", error.message);

      return bot.sendMessage(chatId, "❌ ডাউনলোড করার সময় সমস্যা হয়েছে!", {
        reply_to_message_id: messageId
      });
    }
  }
};
