module.exports = {
    config: {
        name: 'avatar',
        role: 0,
        cooldown: 5,
        description: 'Get your (or a replied user\'s) profile photo',
        usePrefix: true,
        author: 'JOY'
    },

    async onStart({ bot, chatId, userId, msg }) {
        const target = (msg.reply_to_message && msg.reply_to_message.from)
            ? msg.reply_to_message.from.id
            : userId;

        try {
            const photos = await bot.getUserProfilePhotos(target, { limit: 1 });
            if (!photos.total_count) {
                return bot.sendMessage(chatId, ' No profile photo found for this user.');
            }
            const fileId = photos.photos[0][0].file_id;
            return bot.sendPhoto(chatId, fileId);
        } catch (err) {
            return bot.sendMessage(chatId, ' Could not fetch avatar.');
        }
    }
};
