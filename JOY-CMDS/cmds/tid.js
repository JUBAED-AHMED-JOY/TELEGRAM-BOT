module.exports = {
    config: {
        name: "tid",
        version: "1.0.0",
        role: 0,
        author: "Joy Ahmed",
        cooldown: 3,
        description: "Get current Thread/Group Chat ID",
        usePrefix: true
    },

    onStart: async function ({ bot, chatId, msg, config }) {
        const prefix = config.prefix || '/';
        const chatType = msg.chat.type === 'private' ? 'Private Chat' : 'Group/Supergroup';

        const tidMessage = 
`✨ ═════════════════ ✨
  🆔  <b><u>𝚃𝙷𝚁𝙴𝙰𝙳 / 𝙲𝙷𝙰𝚃 𝙸𝙳</u></b>
✨ ═════════════════ ✨

📌 <b>𝙲𝚑𝚊𝚝 𝙸𝙳:</b> <code>${chatId}</code>
🏷️ <b>𝙲𝚑𝚊𝚝 𝚃𝚢𝚙𝚎:</b> <i>${chatType}</i>
👑 <b>𝙱𝚘𝚝 𝙾𝚠𝚗𝚎𝚛:</b>  <b><u>𝙹𝚘𝚢 𝙰𝚑𝚖𝚎𝚍</u></b>`;

        return bot.sendMessage(chatId, tidMessage, {
            parse_mode: 'HTML',
            reply_to_message_id: msg.message_id
        });
    }
};
