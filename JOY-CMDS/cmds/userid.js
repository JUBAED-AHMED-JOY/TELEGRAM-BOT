module.exports = {
    config: {
        name: 'userid',
        role: 0,
        cooldown: 2,
        description: 'Get your (or a replied user\'s) Telegram ID',
        usePrefix: true,
        author: 'JOY'
    },

    async onStart({ bot, chatId, userId, msg }) {
        const target = (msg.reply_to_message && msg.reply_to_message.from)
            ? msg.reply_to_message.from.id
            : userId;

        return bot.sendMessage(chatId, ` User ID: ${target}`);
    }
};
