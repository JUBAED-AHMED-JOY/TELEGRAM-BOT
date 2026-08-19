const axios = require("axios");

if (!global.globalHandleReply) {
    global.globalHandleReply = [];
}

module.exports = {
  config: {
    name: "bot",
    author: "JOY AHMED",
    aliases: ["sim", "simsimi"],
    usePrefix: false,
    role: 0,
    cooldown: 2,
    description: "AI SimSimi Chat Reply System"
  },

  onStart: async function ({ bot, chatId, userId, msg, args }) {
    const messageId = msg ? msg.message_id : undefined;
    const usermsg = args ? args.join(" ") : "";

    // 👉 ১. কোনো টেক্সট না থাকলে গ্রিটিং দেওয়া
    if (!usermsg) {
      const greetings = [
        "আহ শুনা আমার তোমার অলিতে গলিতে উম্মাহ😇😘",
        "কি গো সোনা আমাকে ডাকছ কেনো",
        "বার বার আমাকে ডাকস কেন😡",
        "আহ শোনা আমার আমাকে এতো ডাকতাছো কেনো আসো বুকে আশো🥱",
        "হুম জান তোমার অইখানে উম্মমাহ😷😘",
        "আসসালামু আলাইকুম বলেন আপনার জন্য কি করতে পারি",
        "আমাকে এতো না ডেকে বস জয়কে একটা গফ দে 🙄"
      ];

      const msgText = greetings[Math.floor(Math.random() * greetings.length)];

      const sent = await bot.sendMessage(chatId, msgText, {
        reply_to_message_id: messageId
      });

      // রিপ্লাই ট্র্যাক করার জন্য পুশ করা
      global.globalHandleReply.push({
        messageID: sent.message_id,
        author: userId,
        handleReply: this.handleReply.bind(this)
      });

      return;
    }

    // 👉 ২. সিমসিমাই এপিআই ফেচ ও রেসপন্স
    try {
      const apis = await axios.get(
        "https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/api.json"
      );

      const apiurl = apis.data.api;

      const res = await axios.get(
        `${apiurl}/sim?type=ask&ask=${encodeURIComponent(usermsg)}`
      );

      const reply = res.data?.data?.msg || res.data?.msg || "🤖 বুঝি নাই কথাটা আবার বলো!";

      const sent = await bot.sendMessage(chatId, reply, {
        reply_to_message_id: messageId
      });

      // রিপ্লাই নেওয়ার জন্য সেভ করা
      global.globalHandleReply.push({
        messageID: sent.message_id,
        author: userId,
        handleReply: this.handleReply.bind(this)
      });

    } catch (err) {
      console.error("❌ Bot API Error:", err.message);
      await bot.sendMessage(chatId, "❌ Bot API সমস্যা করছে!", {
        reply_to_message_id: messageId
      });
    }
  },

  // 👉 ৩. চ্যাট মেসেজে ইউজার রিপ্লাই দিলে এটি কল হবে
  handleReply: async function ({ bot, event, handleReply }) {
    const chatId = event.threadId;
    const messageId = event.messageID;
    const text = event.body;

    if (!text) return;

    try {
      const apis = await axios.get(
        "https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/api.json"
      );

      const apiurl = apis.data.api;

      const res = await axios.get(
        `${apiurl}/sim?type=ask&ask=${encodeURIComponent(text)}`
      );

      const reply = res.data?.data?.msg || res.data?.msg || "🤖 বুঝি নাই কথাটা আবার বলো!";

      const sent = await bot.sendMessage(chatId, reply, {
        reply_to_message_id: messageId
      });

      // পরপর আনলিমিটেড রিপ্লাই কন্টিনিউ রাখার জন্য নতুন মেসেজ আইডি পুশ
      global.globalHandleReply.push({
        messageID: sent.message_id,
        author: event.senderID,
        handleReply: this.handleReply.bind(this)
      });

    } catch (err) {
      console.error("❌ Reply error:", err.message);
    }
  }
};
