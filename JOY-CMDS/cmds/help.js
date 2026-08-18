const axios = require('axios');

module.exports = {
    config: {
        name: 'help',
        role: 0,
        cooldown: 3,
        description: 'List all available commands',
        usePrefix: true,
        author: 'JOY'
    },

    async onStart({ bot, chatId, commands, config }) {
        const prefix = (config && config.prefix) || '/';

        if (!commands || commands.length === 0) {
            return bot.sendMessage(chatId, 'No commands loaded.');
        }

        const lines = commands
            .map((c, index) => `➤ ${index + 1} ✿ ${prefix}${c.config.name}`)
            .join('\n');

        const message = 
`╭───❍ 𝗛𝗲𝗹𝗽-𝗠𝗲𝗻𝘂 ❍───
│
${lines}
│
╰───────────────────
🌿 ★ 𝗝𝗢𝗬-𝗧𝗚-𝗕𝗢𝗧 ★
Total Cmd: [ ${commands.length} ]
BOT DEVELOPER JOY AHMED`;

        const imageUrl = 'https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/bot.png';

        try {
            // GitHub URL থেকে ছবি Buffer আকারে ডাউনলোড করা
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data, 'utf-8');

            // Buffer থেকে Telegram এ ছবি সেন্ড করা
            return await bot.sendPhoto(chatId, imageBuffer, { caption: message });
        } catch (error) {
            console.error('Photo Send Error:', error.message);
            // ছবি ফেইল করলে ব্যাকআপ হিসেবে শুধু টেক্সট মেসেজ যাবে
            return await bot.sendMessage(chatId, message);
        }
    }
};
