// ================= TELEGRAM ADAPTER =================
// A thin wrapper around the node-telegram-bot-api instance so commands
// can call simple, consistent methods (api.sendMessage, api.editMessage, ...)

class TelegramAdapter {
    constructor(bot) {
        this.bot = bot;
    }

    sendMessage(chatId, text, options = {}) {
        return this.bot.sendMessage(chatId, text, options);
    }

    replyMessage(chatId, messageId, text, options = {}) {
        return this.bot.sendMessage(chatId, text, { reply_to_message_id: messageId, ...options });
    }

    editMessage(chatId, messageId, text, options = {}) {
        return this.bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...options });
    }

    deleteMessage(chatId, messageId) {
        return this.bot.deleteMessage(chatId, messageId);
    }

    sendPhoto(chatId, photo, options = {}) {
        return this.bot.sendPhoto(chatId, photo, options);
    }

    sendDocument(chatId, doc, options = {}) {
        return this.bot.sendDocument(chatId, doc, options);
    }

    sendInlineKeyboard(chatId, text, buttons = []) {
        return this.bot.sendMessage(chatId, text, {
            reply_markup: { inline_keyboard: buttons }
        });
    }

    getChatMember(chatId, userId) {
        return this.bot.getChatMember(chatId, userId);
    }
}

module.exports = TelegramAdapter;
