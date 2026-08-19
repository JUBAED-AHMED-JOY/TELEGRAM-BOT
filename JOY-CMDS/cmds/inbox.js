module.exports = {
  config: {
    author: 'JOY',
    name: 'inbox',
    role: 0, // সবাই ব্যবহার করতে পারবে
    cooldown: 5,
    description: 'Sends a message to user inbox or mentioned user inbox',
    usePrefix: true
  },

  onStart: async function ({ bot, chatId, msg, args }) {
    const { message_id, reply_to_message, entities, from } = msg;

    let targetID = from.id; // ডিফল্টভাবে যে কমান্ড দিয়েছে তার ইনবক্স
    let targetName = from.first_name || "User";
    let isSelf = true;

    // ১. অন্য কাউকে রিপ্লাই দেওয়া হয়েছে কিনা চেক করা
    if (reply_to_message && reply_to_message.from) {
      targetID = reply_to_message.from.id;
      targetName = reply_to_message.from.first_name || "User";
      isSelf = false;
    } 
    // ২. অন্য কাউকে মেনশন (Tag) করা হয়েছে কিনা চেক করা
    else if (entities && entities.length > 0) {
      const mentionEntity = entities.find(e => e.type === "text_mention");
      if (mentionEntity && mentionEntity.user) {
        targetID = mentionEntity.user.id;
        targetName = mentionEntity.user.first_name || "User";
        isSelf = false;
      }
    }

    // কাস্টম টেক্সট থাকলে নেওয়া, না থাকলে ডিফল্ট মেসেজ
    const customText = args.length > 0 ? args.join(" ") : "হ্যালো! আশা করি আপনি ভালো আছেন।";
    const senderName = from.first_name || "একজন ইউজার";

    // ইনবক্সে পাঠানোর মেসেজ ডিজাইন
    const inboxMsg = isSelf ? 
`📥 ━━━ ❪ 𝗬𝗢𝗨𝗥 𝗜𝗡𝗕𝗢𝗫 𝗠𝗘𝗦𝗦𝗔𝗚𝗘 ❫ ━━━ 📥

👋 **হ্যালো ${targetName}!**
💬 **মেসেজ:** ${customText}

✨ *আমাদের সার্ভিস ব্যবহার করার জন্য ধন্যবাদ!*`
: 
`📩 ━━━ ❪ 𝗜𝗡𝗕𝗢𝗫 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 ❫ ━━━ 📩

👤 **প্রেরক:** ${senderName}
💬 **মেসেজ:** ${customText}

📌 *এই মেসেজটি আপনাকে গ্রুপ থেকে পাঠানো হয়েছে।*`;

    try {
      // টার্গেট ইউজারের ইনবক্সে মেসেজ পাঠানো
      await bot.sendMessage(targetID, inboxMsg, { parse_mode: "Markdown" });

      // গ্রুপে কনফার্মেশন নোটিশ দেওয়া
      const confirmText = isSelf ? 
        `✅ **[${targetName}](tg://user?id=${targetID}) আপনার ইনবক্সে চেক করুন, মেসেজ পাঠানো হয়েছে!**` :
        `✅ **[${targetName}](tg://user?id=${targetID}) এর ইনবক্সে সফলভাবে মেসেজ পাঠানো হয়েছে!**`;

      return await bot.sendMessage(chatId, confirmText, { 
        reply_to_message_id: message_id, 
        parse_mode: "Markdown" 
      });

    } catch (error) {
      // ইউজার বটকে আগে প্রাইভেটে /start না করে থাকলে এই মেসেজ দেখাবে
      return await bot.sendMessage(
        chatId, 
        `❌ **[${targetName}](tg://user?id=${targetID}) আপনার ইনবক্সে মেসেজ পাঠানো সম্ভব হয়নি!**\n\n💡 *দয়া করে বটটিকে আগে ইনবক্সে একবার /start দিন।*`, 
        { reply_to_message_id: message_id, parse_mode: "Markdown" }
      );
    }
  }
};
