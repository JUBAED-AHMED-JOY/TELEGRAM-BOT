module.exports = {
    config: {
        name: 'groupid',
        role: 0,
        cooldown: 2,
        description: 'Get this chat\'s ID',
        usePrefix: true,
        author: 'JOY'
    },

    async onStart({ bot, chatId }) {
        return bot.sendMessage(chatId, ` Chat ID: ${chatId}`);
    }
};
