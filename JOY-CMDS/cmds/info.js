const axios = require('axios');

module.exports = {
    config: {
        name: 'info',
        role: 0,
        cooldown: 3,
        description: 'Show bot and developer info',
        usePrefix: true,
        author: 'JOY'
    },

    async onStart({ bot, chatId, config }) {
        const imageUrl = 'https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/bot.png';

        const message = 
`╭───❍ 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 𝗜𝗡𝗙𝗢 ❍───
│
├➤ 👤 𝗡𝗮𝗺𝗲 : 𝗝𝗼𝘆 𝗔𝗵𝗺𝗲𝗱
├➤ 📍 𝗔𝗱𝗱𝗿𝗲𝘀𝘀 : 𝗝𝗮𝗺𝗮𝗹𝗽𝘂𝗿
├➤ 🎂 𝗔𝗴𝗲 : 𝟭𝟳＋
├➤ 💍 𝗦𝘁𝗮𝘁𝘂𝘀 : 𝘀𝗶𝗻𝗴𝗹𝗲
│
╰──────────────────────────
🌿 ★ 𝗝𝗢𝗬-𝗧𝗚-𝗕𝗢𝗧 ★
𝗕𝗢𝗧 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 𝗝𝗢𝗬 𝗔𝗛𝗠𝗘𝗗`;

        // শুধু বাটনগুলো রাখা হয়েছে
        const options = {
            caption: message,
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
            // GitHub URL থেকে ছবি Buffer হিসেবে নিয়ে পাঠানো
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data, 'utf-8');

            return await bot.sendPhoto(chatId, imageBuffer, options);
        } catch (error) {
            console.error('Info Command Error:', error.message);
            // ব্যাকআপ হিসেবে টেক্সট এবং বাটন সেন্ড করবে
            return await bot.sendMessage(chatId, message, { reply_markup: options.reply_markup });
        }
    }
};
