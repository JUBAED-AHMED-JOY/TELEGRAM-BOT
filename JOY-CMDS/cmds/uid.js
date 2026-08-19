module.exports = {
  config: {
    author: 'JOY',
    name: 'uid',
    role: 0, // সবাই ব্যবহার করতে পারবে
    cooldown: 3,
    description: 'Get user info, UID, and profile picture',
    usePrefix: true
  },

  onStart: async function ({ bot, chatId, msg }) {
    const { message_id, reply_to_message, entities, from } = msg;

    let targetUser = from;

    // ১. অন্য কাউকে রিপ্লাই দেওয়া হয়েছে কিনা চেক করা
    if (reply_to_message && reply_to_message.from) {
      targetUser = reply_to_message.from;
    } 
    // ২. অন্য কাউকে মেনশন (Tag) করা হয়েছে কিনা চেক করা
    else if (entities && entities.length > 0) {
      const mentionEntity = entities.find(e => e.type === "text_mention");
      if (mentionEntity && mentionEntity.user) {
        targetUser = mentionEntity.user;
      }
    }

    const userId = targetUser.id;
    const firstName = targetUser.first_name || "N/A";
    const lastName = targetUser.last_name ? ` ${targetUser.last_name}` : "";
    const fullName = firstName + lastName;
    const username = targetUser.username ? `@${targetUser.username}` : "নাই";

    // ইউজারের মেসেজ টেমপ্লেট
    const captionText = 
`👤 **USER INFORMATION**

📛 **নাম:** ${fullName}
🆔 **ইউজার আইডি (UID):** \`${userId}\`
🏷️ **ইউজারনেম:** ${username}

✨ *JOY Telegram Bot Framework*`;

    try {
      // প্রোফাইল পিকচার সংগ্রহের চেষ্টা
      const userPhotos = await bot.getUserProfilePhotos(userId, { limit: 1 });

      if (userPhotos.total_count > 0) {
        // প্রোফাইল পিক থাকলে ছবির সাথে তথ্য পাঠাবে
        const photoFileId = userPhotos.photos[0][0].file_id;
        return await bot.sendPhoto(chatId, photoFileId, {
          caption: captionText,
          reply_to_message_id: message_id,
          parse_mode: 'Markdown'
        });
      } else {
        // প্রোফাইল পিক না থাকলে শুধু টেক্সট পাঠাবে
        return await bot.sendMessage(chatId, captionText, {
          reply_to_message_id: message_id,
          parse_mode: 'Markdown'
        });
      }

    } catch (error) {
      console.error("UID Command Error:", error);
      return await bot.sendMessage(chatId, `🆔 **ইউজার আইডি:** \`${userId}\`\n📛 **নাম:** ${fullName}`, {
        reply_to_message_id: message_id,
        parse_mode: 'Markdown'
      });
    }
  }
};
