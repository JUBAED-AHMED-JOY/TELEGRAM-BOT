const axios = require('axios');

module.exports = {
    config: {
        name: 'owner',
        author: 'JOY',
        role: 0,
        cooldown: 5,
        description: 'Show bot owner info with photo',
        usePrefix: true
    },

    async onStart({ bot, chatId, msg, config }) {
        const ownerName = config.owner_name || 'JUBAED AHMED JOY';
        const ownerId = config.owner_id || 'Not Set';

        const captionText = 
`╭───❍ 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 ❍───
│
├➤ 👑 𝗡𝗮𝗺𝗲 : 「 ${ownerName} 」
├➤ 🆔 𝗜𝗗 : 「 ${ownerId} 」
├➤ 🤖 𝗥𝗼𝗹𝗲 : Bot Owner & Developer
├➤ 🛠️ 𝗙𝗿𝗮𝗺𝗲𝘄𝗼𝗿𝗸 : JOY TG BOT
│
├➤ 💬 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 : wa.me/8801709045888
├➤ ✈️ 𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺 : t.me/JOY_AHMED_88
│
╰─────────────────────────────
🌿 ★ 𝗝𝗢𝗬-𝗧𝗚-𝗕𝗢𝗧 ★
𝗕𝗢𝗧 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 𝗝𝗢𝗬 𝗔𝗛𝗠𝗘𝗗`;

        const imageUrl = "https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/bot.png";

        const options = {
            caption: captionText,
            reply_to_message_id: msg ? msg.message_id : undefined,
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '💬 WhatsApp', url: 'https://wa.me/8801709045888' },
                        { text: '✈️ Telegram', url: 'https://t.me/JOY_AHMED_88' }
                    ]
                ]
            }
        };

        try {
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data, 'utf-8');

            return await bot.sendPhoto(chatId, imageBuffer, options);
        } catch (error) {
            return await bot.sendMessage(chatId, captionText, {
                reply_to_message_id: msg ? msg.message_id : undefined,
                reply_markup: options.reply_markup
            });
        }
    }
};
