module.exports = {
    config: {
        name: 'help',
        role: 0,
        cooldown: 3,
        description: 'List all available commands',
        usePrefix: true,
        author: 'JOY'
    },

    async onStart({ bot, chatId, commands, config }) {
        const prefix = (config && config.prefix) || '/';

        if (!commands || commands.length === 0) {
            return bot.sendMessage(chatId, 'No commands loaded.');
        }

        const lines = commands
            .map(c => ` ${prefix}${c.config.name} - ${c.config.description || 'No description'} [by ${c.config.author || 'Unknown'}]`)
            .join('\n');

        return bot.sendMessage(chatId, ` Available commands:\n\n${lines}\n\n Framework by JOY`);
    }
};
