const os = require('os');

module.exports = {
    config: {
        name: "upt",
        version: "1.0.0",
        role: 0,
        author: "Joy Ahmed",
        cooldown: 3,
        description: "Check bot uptime and server system status",
        usePrefix: true
    },

    onStart: async function ({ bot, chatId, msg }) {
        const uptimeSeconds = process.uptime();

        // সময় হিসাব (Days, Hours, Minutes, Seconds)
        const days = Math.floor(uptimeSeconds / (3600 * 24));
        const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeSeconds % 60);

        // RAM & Server Info
        const totalMemMB = (os.totalmem() / (1024 * 1024)).toFixed(0);
        const freeMemMB = (os.freemem() / (1024 * 1024)).toFixed(0);
        const usedMemMB = (totalMemMB - freeMemMB).toFixed(0);

        const uptimeText = 
`⚡ ═════════════════ ⚡
  🤖  <b><u>𝙱𝙾𝚃  𝚄𝙿𝚃𝙸𝙼𝙴  𝚂𝚃𝙰𝚃𝚄𝚂</u></b>
⚡ ═════════════════ ⚡

⌛ <b>𝚄𝚙𝚝𝚒𝚖𝚎:</b> <code>${days}d ${hours}h ${minutes}m ${seconds}s</code>
📊 <b>𝚁𝙰𝙼 𝚄𝚜𝚊𝚐𝚎:</b> <code>${usedMemMB} MB / ${totalMemMB} MB</code>
💻 <b>𝙿𝚕𝚊𝚝𝚏𝚘𝚛𝚖:</b> <code>${os.platform()} (${os.arch()})</code>
🟢 <b>𝚂𝚝𝚊𝚝𝚞𝚜:</b> <i>Smoothly Running 🚀</i>

👑 <b>𝙾𝚯𝚗𝚎𝚛:</b> <b><u>𝙹𝚘𝚢 𝙰𝚑𝚖𝚎𝚍</u></b>`;

        return bot.sendMessage(chatId, uptimeText, {
            parse_mode: 'HTML',
            reply_to_message_id: msg.message_id
        });
    }
};
