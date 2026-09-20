const axios = require('axios');

module.exports = {
    config: {
        name: "picedit",
        version: "1.0.0",
        role: 0,
        author: "Joy Ahmed",
        cooldown: 5,
        description: "Edit image with various effects/filters",
        usePrefix: true
    },

    onStart: async function ({ bot, chatId, args, msg, config }) {
        const prefix = config.prefix || '/';

        // ১. ছবিতে রিপ্লাই দেওয়া হয়েছে কি না চেক করা
        if (!msg.reply_to_message || !msg.reply_to_message.photo) {
            const usageText = 
`⚠️ <b><u>𝙿𝙸𝙲𝙴𝙳𝙸𝚃  𝙲𝙾𝙼𝙼𝙰𝙽𝙳  𝚄𝚂𝙰𝙶𝙴</u></b>

👉 <b>যেকোনো ছবিতে রিপ্লাই দিয়ে নিচের অপশনগুলো ব্যবহার করুন:</b>

• <code>${prefix}picedit blur</code> (ছবি ঝাপসা করতে)
• <code>${prefix}picedit gray</code> (ব্ল্যাক & হোয়াইট করতে)
• <code>${prefix}picedit invert</code> (কালার ইনভার্ট করতে)
• <code>${prefix}picedit pixel</code> (পিক্সেল ইফেক্ট দিতে)
• <code>${prefix}picedit sepia</code> (সেপিয়া টোন দিতে)`;

            return bot.sendMessage(chatId, usageText, {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });
        }

        const effect = args[0] ? args[0].toLowerCase() : 'gray';

        const loadingMsg = await bot.sendMessage(chatId, "🎨 <i>ছবি প্রসেসিং করা হচ্ছে, অপেক্ষা করুন...</i>", {
            parse_mode: 'HTML',
            reply_to_message_id: msg.message_id
        });

        try {
            // ২. রিপ্লাই করা ছবির Telegram File Link বের করা
            const photoArray = msg.reply_to_message.photo;
            const fileId = photoArray[photoArray.length - 1].file_id;
            const photoUrl = await bot.getFileLink(fileId);

            // ৩. API দিয়ে ফিল্টার অ্যাপ্লাই করা (Image processing API)
            let processedApiUrl = "";

            if (effect === 'blur') {
                processedApiUrl = `https://api.popcat.xyz/blur?image=${encodeURIComponent(photoUrl)}`;
            } else if (effect === 'invert') {
                processedApiUrl = `https://api.popcat.xyz/invert?image=${encodeURIComponent(photoUrl)}`;
            } else if (effect === 'pixel' || effect === 'pixelate') {
                processedApiUrl = `https://api.popcat.xyz/pixelate?image=${encodeURIComponent(photoUrl)}`;
            } else if (effect === 'greyscale' || effect === 'gray') {
                processedApiUrl = `https://api.popcat.xyz/greyscale?image=${encodeURIComponent(photoUrl)}`;
            } else {
                processedApiUrl = `https://api.popcat.xyz/greyscale?image=${encodeURIComponent(photoUrl)}`;
            }

            // ৪. প্রসেস হওয়া পিকচার চ্যাটে পাঠানো
            await bot.sendPhoto(chatId, processedApiUrl, {
                caption: `🎨 <b><u>𝙿𝙷𝙾𝚃𝙾  𝙴𝙳𝙸𝚃𝙴𝙳</u></b>\n\n✨ <b>𝙴𝚏𝚏𝚎𝚌𝚝:</b> <code>${effect}</code>\n👑 <b>𝙾𝚯𝚗𝚎𝚛:</b> <b><u>𝙹𝚘𝚢 𝙰𝚑𝚖𝚎𝚍</u></b>`,
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });

            // লোডিং মেসেজ ডিলিট
            await bot.deleteMessage(chatId, loadingMsg.message_id);

        } catch (err) {
            console.error('Pic Edit Error:', err.message);
            return bot.editMessageText("❌ <i>ছবি প্রসেস করতে সমস্যা হয়েছে! আবার চেষ্টা করুন।</i>", {
                chat_id: chatId,
                message_id: loadingMsg.message_id,
                parse_mode: 'HTML'
            });
        }
    }
};
