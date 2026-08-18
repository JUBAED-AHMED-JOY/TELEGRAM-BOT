module.exports = {
    config: {
        name: 'say',
        role: 2, // bot owner only
        cooldown: 2,
        description: 'Make the bot repeat a message (owner only)',
        usePrefix: true,
        author: 'JOY'
    },

    async onStart({ bot, chatId, args }) {
        if (!args.length) {
            return bot.sendMessage(chatId, 'Usage: say <text>');
        }
        return bot.sendMessage(chatId, args.join(' '));
    }
};
