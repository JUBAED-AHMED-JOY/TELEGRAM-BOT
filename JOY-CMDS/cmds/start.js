module.exports = {
    config: {
        name: 'start',
        role: 0,
        cooldown: 5,
        description: 'Welcome message for new users',
        usePrefix: true,
        author: 'JOY'
    },

    async onStart({ bot, chatId, msg, config }) {
        const name = (msg && msg.from && msg.from.first_name) || 'there';
        const botName = (config && config.bot_name) || 'JOY BOT';
        const prefix = (config && config.prefix) || '/';

        const text =
            ` Hey ${name}! Welcome to ${botName}.\n\n` +
            `Use ${prefix}help to see all available commands.`;

        return bot.sendMessage(chatId, text);
    }
};
