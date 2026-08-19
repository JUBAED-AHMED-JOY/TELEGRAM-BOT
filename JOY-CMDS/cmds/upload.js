const axios = require("axios");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "upload",
    author: "JOY AHMED",
    aliases: ["imgbb", "imgur", "top3"],
    usePrefix: true,
    role: 0,
    cooldown: 5,
    description: "ছবি বা ভিডিও আপলোড করে শর্ট লিংক তৈরি করার কমান্ড"
  },

  onStart: async function ({ bot, chatId, msg }) {
    const messageId = msg ? msg.message_id : undefined;

    // ১. ইউজার কোনো ছবি বা ভিডিওতে রিপ্লাই দিয়েছে কিনা চেক করা
    const reply = msg.reply_to_message;
    if (!reply || (!reply.photo && !reply.video)) {
      return await bot.sendMessage(
        chatId, 
        "⚠️ **অনুগ্রহ করে যেকোনো ছবি (Photo) বা ভিডিওতে (Video) রিপ্লাই দিয়ে `/upload` লিখুন!**", 
        { 
          reply_to_message_id: messageId,
          parse_mode: "Markdown"
        }
      );
    }

    const waitingMsg = await bot.sendMessage(
      chatId, 
      "⏳ **ফাইলটি সার্ভারে আপলোড করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...**", 
      { reply_to_message_id: messageId, parse_mode: "Markdown" }
    );
    const waitId = waitingMsg.message_id;

    try {
      // ২. ফাইলের আইডি সংগ্রহ করা
      let fileId;
      let extension;

      if (reply.photo) {
        // সবচেয়ে হাই রেজুলেশনের ছবি নেওয়া
        fileId = reply.photo[reply.photo.length - 1].file_id;
        extension = "jpg";
      } else if (reply.video) {
        fileId = reply.video.file_id;
        extension = "mp4";
      }

      // ৩. টেলিগ্রাম সার্ভার থেকে ফাইলের ডাউনলোড লিংক বের করা
      const fileLink = await bot.getFileLink(fileId);

      // ৪. ফাইল ডাউনলোড করা
      const fileResponse = await axios.get(fileLink, { responseType: "arraybuffer" });
      const fileBuffer = Buffer.from(fileResponse.data);

      // ৫. FormData প্রস্তুত করা
      const formData = new FormData();
      formData.append("file", fileBuffer, {
        filename: `media.${extension}`,
        contentType: extension === "mp4" ? "video/mp4" : "image/jpeg"
      });

      // ৬. API-তে আপলোড করা
      const response = await axios.post("https://joy-upload-api.vercel.app/api/upload", formData, {
        headers: { ...formData.getHeaders() }
      });

      // ৭. প্রসেসিং শেষে লিংক পাঠানো
      if (response.data && (response.data.link || response.data.url)) {
        const generatedLink = response.data.link || response.data.url;

        // ওয়েটিং মেসেজটি ডিলিট করা
        await bot.deleteMessage(chatId, waitId).catch(() => {});

        const uploadText = 
`⚡ ━━━ ❪ 𝗠𝗘𝗗𝗜𝗔 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗗 ❫ ━━━ ⚡

╭───────────❍
│ ✅ **Status:** File Uploaded Successfully!
│ 📁 **Type:** ${extension.toUpperCase()}
├───────────
│ 🔗 **Direct Link:**
│ ${generatedLink}
╰───────────❍

✨ 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 𝗝𝗢𝗬 𝗔𝗛𝗠𝗘𝗗 ✨`;

        return await bot.sendMessage(chatId, uploadText, { 
          reply_to_message_id: messageId,
          parse_mode: "Markdown"
        });
      } else {
        throw new Error((response.data && response.data.error) || "আপলোড করতে সমস্যা হয়েছে।");
      }

    } catch (error) {
      // এরর হলে ওয়েটিং মেসেজটি মুছে দিয়ে এরর জানানো
      await bot.deleteMessage(chatId, waitId).catch(() => {});
      console.error("Upload Command Error:", error.message);

      return await bot.sendMessage(
        chatId, 
        `❌ **আপলোড ব্যর্থ হয়েছে!**\n**Error:** ${error.message}`, 
        { reply_to_message_id: messageId, parse_mode: "Markdown" }
      );
    }
  }
};

