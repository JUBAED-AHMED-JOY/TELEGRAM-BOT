module.exports = {
    config: {
        name: 'info',
        role: 0,
        cooldown: 5,
        description: 'Show bot information',
        usePrefix: true,
        author: 'JOY'
    },

    async onStart({ bot, chatId, config, commands }) {
        const text =
            ` ${config.bot_name || 'JOY BOT'}\n` +
            ` Owner: ${config.owner_name}\n` +
            ` Prefix: ${config.prefix}\n` +
            ` Commands loaded: ${commands.length}\n` +
            ` Developed by: JOY`;

        return bot.sendMessage(chatId, text);
    }
};
