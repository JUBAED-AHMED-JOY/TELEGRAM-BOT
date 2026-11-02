const axios = require("axios");

module.exports = {
  config: {
    author: "Joy",
    name: "xx",
    aliases: ["xvideo", "video"],
    usePrefix: true,
    role: 0,
    cooldown: 10,
    description: "Search and Send Random Multiple Videos with Number Buttons",
    category: "media",
    usages: "/xx <search query>"
  },

  onStart: async function ({ bot, chatId, msg, args }) {
    const messageId = msg ? msg.message_id : undefined;

    if (!args.length) {
      return bot.sendMessage(chatId, "⚠️ ভিডিওর নাম বা কুয়েরি দিন। যেমন: /xx girl", {
        reply_to_message_id: messageId
      });
    }

    const query = args.join(" ");
    let loading = null;
    const apiKey = "joy"; 
    const domain = "https://joy-404-pron-api-all.vercel.app";

    try {
      loading = await bot.sendMessage(chatId, "⏳ র্যান্ডম ভিডিও এবং স্ক্রিনশট খোঁজা হচ্ছে...", {
        reply_to_message_id: messageId
      });

      // ১. API থেকে ভিডিও সার্চ করা
      const searchUrl = `${domain}/api/videos?apikey=${apiKey}&q=${encodeURIComponent(query)}`;
      const searchRes = await axios.get(searchUrl, { timeout: 9000 });

      if (loading) await bot.deleteMessage(chatId, loading.message_id).catch(() => {});

      if (!searchRes.data || !searchRes.data.success || !searchRes.data.videos || searchRes.data.videos.length === 0) {
        return bot.sendMessage(chatId, "❌ কোনো ভিডিও পাওয়া যায়নি!", {
          reply_to_message_id: messageId
        });
      }

      // 🔄 বারবার একই ভিডিও আসা রোধ করতে সার্চ লিস্ট থেকে র্যান্ডমভাবে এলোমেলো করে ৫টি ভিডিও সিলেক্ট করা
      const allVideos = searchRes.data.videos;
      const shuffled = allVideos.sort(() => 0.5 - Math.random()); // অ্যারে শাফেল করা
      const videosList = shuffled.slice(0, 5); // সর্বোচ্চ ৫টি নেওয়া

      let listText = "🎬 **সার্চ রেজাল্ট (র্যান্ডম ভিডিও তালিকা):**\n\n";
      const buttonRow = [];
      const mediaGroup = [];

      for (let i = 0; i < videosList.length; i++) {
        const v = videosList[i];
        const num = i + 1;
        
        // লিস্ট টেক্সট তৈরি
        listText += `🔹 **[${num}]** ${v.title}\n⏱ ডিউরেশন: ${v.duration || "N/A"}\n\n`;

        // প্রতিটি ভিডিওর স্ট্রিম লিংক ফেচ করা
        try {
          const streamApiUrl = `${domain}/api/stream?apikey=${apiKey}&url=${encodeURIComponent(v.url)}`;
          const streamRes = await axios.get(streamApiUrl, { timeout: 5000 });
          
          if (streamRes.data && streamRes.data.success) {
            const directUrl = streamRes.data.video_url;
            buttonRow.push({ text: `${num}`, url: directUrl });
          }
        } catch (e) {
          // কোনোটার লিংক ফেচ করতে সমস্যা হলে স্কিপ করবে
        }

        // থাম্বনেইল থাকলে মিডিয়া গ্রুপে (অ্যালবামে) যুক্ত করা
        if (v.thumbnail) {
          mediaGroup.push({
            type: 'photo',
            media: v.thumbnail,
            caption: i === 0 ? `🎬 **${query}** এর র্যান্ডম সার্চ রেজাল্ট:\n\n${listText}` : undefined,
            parse_mode: 'Markdown'
          });
        }
      }

      if (buttonRow.length === 0) {
        return bot.sendMessage(chatId, "❌ ভিডিওর লিংক প্রসেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", {
          reply_to_message_id: messageId
        });
      }

      const keyboard = {
        inline_keyboard: [buttonRow] // ১, ২, ৩, ৪, ৫ বাটনগুলো এক লাইনে থাকবে
      };

      // ২. ছবি বা অ্যালবাম পাঠানো
      if (mediaGroup.length > 0) {
        mediaGroup[0].caption = `🎬 **র্যান্ডম সার্চ রেজাল্ট:**\n\n` + listText + `👇 নিচে থেকে ছবির সিরিয়াল অনুযায়ী বাটনে ক্লিক করুন:`;

        try {
          await bot.sendMediaGroup(chatId, mediaGroup, {
            reply_to_message_id: messageId
          });

          await bot.sendMessage(chatId, `🎮 **ভিডিও দেখতে নিচের বাটনগুলোতে ক্লিক করুন:**`, {
            reply_to_message_id: messageId,
            reply_markup: JSON.stringify(keyboard)
          });
        } catch (mediaErr) {
          await bot.sendMessage(chatId, listText + `\n👇 নিচে থেকে বাটনে ক্লিক করে ভিডিও দেখুন:`, {
            reply_to_message_id: messageId,
            reply_markup: JSON.stringify(keyboard),
            parse_mode: "Markdown"
          });
        }
      } else {
        await bot.sendMessage(chatId, listText + `\n👇 নিচে থেকে বাটনে ক্লিক করে ভিডিও দেখুন:`, {
          reply_to_message_id: messageId,
          reply_markup: JSON.stringify(keyboard),
          parse_mode: "Markdown"
        });
      }

    } catch (err) {
      console.error("Vercel Bot Error:", err.message);
      if (loading) await bot.deleteMessage(chatId, loading.message_id).catch(() => {});

      return bot.sendMessage(chatId, "❌ সার্ভার টাইমআউট বা প্রসেস করতে সমস্যা হয়েছে।", {
        reply_to_message_id: messageId
      });
    }
  }
};
