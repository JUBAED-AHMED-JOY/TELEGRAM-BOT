module.exports = {
    config: {
        name: 'ping',
        role: 0,
        cooldown: 2,
        description: 'Check if the bot is alive and its response time',
        usePrefix: true,
        author: 'JOY'
    },

    async onStart({ bot, chatId }) {
        const start = Date.now();
        const sent = await bot.sendMessage(chatId, ' Pinging...');
        const latency = Date.now() - start;

        return bot.editMessageText(` Pong! ${latency}ms`, {
            chat_id: chatId,
            message_id: sent.message_id
        });
    }
};
