const utils = require('../../JOY/utils.js');

module.exports = {
    config: {
        name: 'uptime',
        role: 0,
        cooldown: 3,
        description: 'Show how long the bot has been running',
        usePrefix: true,
        author: 'JOY'
    },

    async onStart({ bot, chatId }) {
        return bot.sendMessage(chatId, ` Uptime: ${utils.getUptime()}`);
    }
};
