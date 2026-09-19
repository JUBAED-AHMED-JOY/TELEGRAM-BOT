const axios = require('axios');

module.exports = {
    config: {
        name: "prefix",
        version: "1.0.0",
        role: 0,
        author: "Joy Ahmed",
        cooldown: 5,
        usePrefix: false // Prefix ছাড়াও কাজ করবে (শুধু prefix লিখলেও হবে)
    },

    onStart: async function ({ bot, chatId, msg, config }) {
        const currentPrefix = config.prefix || '/';
        const imageUrl = 'https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/bot.png';

        const captionText = 
`✨ ═════════════════ ✨
  🤖  <b><u>𝙱𝙾𝚃 𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝚃𝙸𝙾𝙽</u></b>
✨ ═════════════════ ✨

📌 <b>𝚂𝚢𝚜𝚝𝚎𝚖 𝙿𝚛𝚎𝚏𝚒𝚡:</b>  [ <code>${currentPrefix}</code> ]
👑 <b>𝙱𝚘𝚝 𝙾𝚠𝚗𝚎𝚛:</b>  <b><u>𝙹𝚘𝚢 𝙰𝚑𝚖𝚎𝚍</u></b>

💡 <b>𝙽𝚘𝚝𝚎:</b> 𝚄𝚜𝚎 <code>${currentPrefix}𝚑𝚎𝚕𝚙</code> 𝚝𝚘 𝚜𝚎𝚎 𝚊𝚕𝚕 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜!`;

        try {
            // ছবি সহ স্টাইলিশ ফন্ট ও ফরম্যাট পাঠানো হচ্ছে
            await bot.sendPhoto(chatId, imageUrl, {
                caption: captionText,
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });
        } catch (err) {
            // যদি ছবি পাঠাতে কোনো সমস্যা হয়, শুধু মেসেজ পাঠাবে
            await bot.sendMessage(chatId, captionText, {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });
        }
    }
};
