const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs-extra");
const path = require("path");
const { downloadVideo } = require("joy-video-downloader");

module.exports = {
  config: {
    author: "Joy",
    name: "video",
    aliases: ["ytvideo"],
    usePrefix: true,
    role: 0,
    cooldown: 10,
    description: "Download Video from YouTube or Search",
    category: "media",
    usages: "/video <name / link>"
  },

  onStart: async function ({ bot, chatId, msg, args }) {
    const messageId = msg ? msg.message_id : undefined;

    if (!args.length) {
      return bot.sendMessage(chatId, "⚠️ ভিডিওর নাম বা লিঙ্ক দিন।", {
        reply_to_message_id: messageId
      });
    }

    let query = args.join(" ");
    let videoLink = query;
    let loading = null;

    try {
      // 🔍 YouTube search
      if (!videoLink.includes("youtu")) {
        const search = await yts(query);
        if (!search || !search.videos.length) {
          return bot.sendMessage(chatId, "❌ ভিডিও পাওয়া যায়নি!", {
            reply_to_message_id: messageId
          });
        }
        videoLink = search.videos[0].url;
      }

      // ⏳ loading message
      loading = await bot.sendMessage(chatId, "⏳ ভিডিও প্রসেসিং ও ডাউনলোড হচ্ছে...", {
        reply_to_message_id: messageId
      });

      // 📁 cache folder
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const filePath = path.join(cacheDir, `video_${Date.now()}.mp4`);

      // 🎬 download
      const data = await downloadVideo(videoLink, filePath);

      if (!data || !fs.existsSync(filePath)) {
        if (loading) await bot.deleteMessage(chatId, loading.message_id).catch(() => {});
        return bot.sendMessage(chatId, "❌ ভিডিও ডাউনলোড করা যায়নি!", {
          reply_to_message_id: messageId
        });
      }

      // 🧹 delete loading msg
      if (loading) await bot.deleteMessage(chatId, loading.message_id).catch(() => {});

      // 🎥 send video stream
      const title = data.title || "Video";
      await bot.sendVideo(chatId, fs.createReadStream(filePath), {
        caption: `🎬 𝗧𝗶𝘁𝗹𝗲: ${title}\n✅ 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲!`,
        reply_to_message_id: messageId
      });

      // 🗑️ delete file safely
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

    } catch (err) {
      console.error("Video error:", err.message);
      if (loading) await bot.deleteMessage(chatId, loading.message_id).catch(() => {});

      return bot.sendMessage(chatId, "❌ ভিডিও ডাউনলোড করতে সমস্যা হয়েছে!", {
        reply_to_message_id: messageId
      });
    }
  }
};
