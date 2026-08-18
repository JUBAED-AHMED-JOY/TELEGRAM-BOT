module.exports = {
    config: {
        author: 'JOY',
        name: 'start',
        role: 0,
        cooldown: 5,
        description: 'Welcome message for new users',
        usePrefix: true
    },

    async onStart({ bot, chatId, msg, config }) {
        const name = (msg && msg.from && msg.from.first_name) || 'User';
        const botName = (config && config.bot_name) || 'JOY TG BOT';
        const prefix = (config && config.prefix) || '/';
        const ownerName = (config && config.owner_name) || 'JUBAED AHMED JOY';

        const welcomeText = 
`⚡ ━━━ ❪ 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗠𝗘𝗦𝗦𝗔𝗚𝗘 ❫ ━━━ ⚡

╭───────────❍
│ 👋 𝗛𝗲𝗹𝗹𝗼, ${name}!
│ 🤖  Welcome to ${botName}
│ ❇️ Status   : Active & Ready
├───────────
│ 💡 Type ${prefix}help to see commands
│ 👑 Creator  : ${ownerName}
╰───────────❍

✨ 𝘛𝘩𝘢𝘯𝘬 𝘺𝘰𝘶 𝘧𝘰𝘳 𝘶𝘴𝘪𝘯𝘨 𝘰𝘶𝘳 𝘴𝘦𝘳𝘷𝘪𝘤𝘦! ✨`;

        return bot.sendMessage(chatId, welcomeText, {
            reply_to_message_id: msg ? msg.message_id : undefined,
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '📜 Help Menu', callback_data: '/help' }
                    ]
                ]
            }
        });
    }
};
