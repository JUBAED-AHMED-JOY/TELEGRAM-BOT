module.exports = {
    config: {
        name: 'getlink',
        role: 0,
        cooldown: 5,
        description: 'Reply kora media message er direct download link dibe',
        usePrefix: true,
        author: 'JOY'
    },

    async onStart({ bot, chatId, msg }) {
        const messageId = msg ? msg.message_id : undefined;
        const replied = msg ? msg.reply_to_message : null;

        const errText = '❌ Ekta audio, video ba photo message e reply diye /getlink dao';

        // Reply chara cholbe na
        if (!replied) {
            return bot.sendMessage(chatId, errText, { reply_to_message_id: messageId });
        }

        // Reply kora message theke file_id ber koro
        let fileId = null;
        if (replied.photo && replied.photo.length > 0) {
            // Photo er sobcheye boro size ta nao (last element)
            fileId = replied.photo[replied.photo.length - 1].file_id;
        } else if (replied.video) {
            fileId = replied.video.file_id;
        } else if (replied.audio) {
            fileId = replied.audio.file_id;
        } else if (replied.document) {
            fileId = replied.document.file_id;
        } else if (replied.voice) {
            fileId = replied.voice.file_id;
        } else if (replied.video_note) {
            fileId = replied.video_note.file_id;
        } else if (replied.animation) {
            fileId = replied.animation.file_id;
        } else if (replied.sticker) {
            fileId = replied.sticker.file_id;
        }

        // Media nai
        if (!fileId) {
            return bot.sendMessage(chatId, errText, { reply_to_message_id: messageId });
        }

        try {
            const link = await bot.getFileLink(fileId);
            return bot.sendMessage(chatId, link, { reply_to_message_id: messageId });
        } catch (e) {
            console.error('GetLink error:', e.message);
            return bot.sendMessage(
                chatId,
                '❌ Link ante pari nai, abar try koro.',
                { reply_to_message_id: messageId }
            );
        }
    }
};
