module.exports = {
    config: {
        name: 'rules',
        role: 0,
        cooldown: 5,
        description: 'Show group rules',
        usePrefix: true,
        author: 'JOY'
    },

    async onStart({ bot, chatId }) {
        const rules =
            `1. Be respectful to everyone.\n` +
            `2. No spamming or flooding the chat.\n` +
            `3. No NSFW or offensive content.\n` +
            `4. Follow admin instructions.`;

        return bot.sendMessage(chatId, ` Group Rules:\n${rules}`);
    }
};
