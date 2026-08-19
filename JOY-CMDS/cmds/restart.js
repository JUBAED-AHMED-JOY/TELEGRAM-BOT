module.exports = {
  config: {
    name: "restart",
    author: "JOY AHMED",
    aliases: ["reboot", "refresh", "reload", "stop"],
    usePrefix: true,
    role: 2, // Bot Owner Only
    cooldown: 0,
    description: "Stops all active Murgi/Spam loops and cleans the bot cache"
  },

  onStart: async function ({ bot, chatId, msg }) {
    const messageId = msg ? msg.message_id : undefined;

    const waitingMsg = await bot.sendMessage(
      chatId, 
      "⏳ **মুরগি স্প্যামের সব লুপ ক্লিয়ার করে বট রিস্টার্ট দেওয়া হচ্ছে...**", 
      { reply_to_message_id: messageId, parse_mode: "Markdown" }
    );

    try {
      let count = 0;

      if (typeof global.reloadBot === "function") {
        count = global.reloadBot();
      }

      await bot.deleteMessage(chatId, waitingMsg.message_id).catch(() => {});

      const successMsg = 
`⚡ ━━━ ❪ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗥𝗘𝗦𝗧𝗔𝗥𝗧𝗘𝗗 ❫ ━━━ ⚡

╭───────────❍
│ ✅ **All Murgi Loops Killed!**
│ 📦 **Loaded Commands:** ${count}
│ 🟢 **Status:** Clean & Ready
╰───────────❍

✨ 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 𝗝𝗢𝗬 𝗔𝗛𝗠𝗘𝗗 ✨`;

      return await bot.sendMessage(chatId, successMsg, {
        reply_to_message_id: messageId,
        parse_mode: "Markdown"
      });

    } catch (error) {
      await bot.deleteMessage(chatId, waitingMsg.message_id).catch(() => {});
      console.error("Restart Error:", error.message);

      return await bot.sendMessage(chatId, `❌ **রিস্টার্ট দিতে সমস্যা হয়েছে!**\nError: ${error.message}`, {
        reply_to_message_id: messageId
      });
    }
  }
};
