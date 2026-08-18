module.exports = {
    config: {
        name: 'owner',
        role: 0,
        cooldown: 5,
        description: 'Show bot owner info',
        usePrefix: true,
        author: 'JOY'
    },

    async onStart({ bot, chatId, config }) {
        const text =
            ` Bot Owner: ${config.owner_name}\n` +
            ` Bot Framework developed by: JOY`;

        return bot.sendMessage(chatId, text);
    }
};
