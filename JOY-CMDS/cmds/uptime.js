const utils = require('../../JOY/utils.js');

module.exports = {
    config: {
        author: 'JOY',
        name: 'uptime',
        role: 0,
        cooldown: 3,
        description: 'Show how long the bot has been running',
        usePrefix: true
    },

    async onStart({ bot, chatId, msg, config }) {
        const uptimeString = utils.getUptime ? utils.getUptime() : 'N/A';
        const ownerName = config ? (config.owner_name || 'JUBAED AHMED JOY') : 'JUBAED AHMED JOY';
        const botName = config ? (config.bot_name || 'JOY TG BOT') : 'JOY TG BOT';

        const uptimeMsg = 
`╭───❍ 𝗕𝗢𝗧 𝗨𝗣𝗧𝗜𝗠𝗘 ❍───
│
├➤ 🤖 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲 : 「 ${botName} 」
├➤ ⏳ 𝗨𝗽𝘁𝗶𝗺𝗲 : 「 ${uptimeString} 」
├➤ 🟢 𝗦𝘁𝗮𝘁𝘂𝘀 : Active & Running
│
├➤ 👑 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿 : ${ownerName}
│
╰─────────────────────────────
🌿 ★ 𝗝𝗢𝗬-𝗧𝗚-𝗕𝗢𝗧 ★
𝗕𝗢𝗧 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 𝗝𝗢𝗬 𝗔𝗛𝗠𝗘𝗗`;

        return bot.sendMessage(chatId, uptimeMsg, {
            reply_to_message_id: msg ? msg.message_id : undefined
        });
    }
};
