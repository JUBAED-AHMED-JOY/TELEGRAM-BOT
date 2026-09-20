module.exports = {
    config: {
        name: "edit",
        version: "1.0.0",
        role: 2, // 2 = Bot Owner Only (Joy Ahmed)
        author: "Joy Ahmed",
        cooldown: 2,
        description: "Edit any message sent by the bot",
        usePrefix: true
    },

    onStart: async function ({ bot, chatId, args, msg, config }) {
        const prefix = config.prefix || '/';

        // চেক করবে যে মেসেজে রিপ্লাই দেওয়া হয়েছে কি না
        if (!msg.reply_to_message) {
            return bot.sendMessage(chatId, `⚠️ <i>বটের যে মেসেজটি এডিট করতে চান, সেটিতে রিপ্লাই দিয়ে কমান্ডটি লিখুন!</i>\n📌 <b>Usage:</b> <code>${prefix}edit <New Text></code>`, {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });
        }

        const newText = args.join(' ');
        if (!newText) {
            return bot.sendMessage(chatId, `⚠️ <i>নতুন কী টেক্সট বসাতে চান তা লিখুন!</i>\n📌 <b>Usage:</b> <code>${prefix}edit Hello World</code>`, {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });
        }

        const targetMessageId = msg.reply_to_message.message_id;

        try {
            // বটের আগের পাঠানো মেসেজ এডিট করা
            await bot.editMessageText(newText, {
                chat_id: chatId,
                message_id: targetMessageId,
                parse_mode: 'HTML'
            });

            // এডিট সফল হলে কমান্ডের মেসেজটি অটো ডিলিট করে দেওয়া (ক্লিন চ্যাটের জন্য)
            await bot.deleteMessage(chatId, msg.message_id).catch(() => {});

        } catch (err) {
            console.error('Edit Command Error:', err.message);
            return bot.sendMessage(chatId, `❌ <i>মেসেজ এডিট করা সম্ভব হয়নি!</i>\n<b>Error:</b> <code>${err.message}</code>`, {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });
        }
    }
};
