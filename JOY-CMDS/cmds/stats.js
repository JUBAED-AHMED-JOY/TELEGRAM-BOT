const fs = require('fs-extra');
const path = require('path');

const messageCountFile = path.join(__dirname, '..', '..', 'messageCount.json');

module.exports = {
    config: {
        name: 'stats',
        role: 0,
        cooldown: 5,
        description: 'Show tracked message stats for this chat',
        usePrefix: true,
        author: 'JOY'
    },

    async onStart({ bot, chatId }) {
        let data = {};
        try {
            data = JSON.parse(fs.readFileSync(messageCountFile));
        } catch {
            data = {};
        }

        const chatData = data[chatId] || {};
        const total = Object.values(chatData).reduce((a, b) => a + b, 0);
        const userCount = Object.keys(chatData).length;

        return bot.sendMessage(chatId, ` This chat has ${total} tracked messages from ${userCount} user(s).`);
    }
};
