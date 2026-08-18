const axios = require('axios');

module.exports = {
    config: {
        name: "___ONLY_SLASH___",
        author: "JOY",
        version: "1.0.0",
        description: "Only / trigger",
        usePrefix: false,
        cooldown: 0,
        role: 0
    },

    async onStart({ bot, chatId, msg, config }) {
        const quotes = [
`•—»✨「𝗝𝗨𝗕𝗔𝗘𝗗_𝗔𝗛𝗠𝗘𝗗_𝗝𝗢𝗬」✨«—•
༆-✿ Prefix Event ༊࿐
╭•┄┅════❁🌺❁════┅┄•╮

᭄࿐-ইচ্ছে!!!গুলো!!!যদি!!!পবিত্র!!হয়!✿᭄
✿᭄তাহলে!!!স্বপ্ন!!! গুলো..🖤🥀
✿᭄ ࿐- একদিন!!!পূরণ!!!হবেই!!! ✿᭄
✿᭄࿐ইনশাআল্লাহ..🖤🥀

╰•┄┅════❁🌺❁════┅┄•╯
𝐂𝐫𝐞𝐚𝐭𝐨𝐫 : 𝗠𝗗 𝗝𝗨𝗕𝗔𝗘𝗗 𝗔𝗛𝗠𝗘𝗗 𝗝𝗢𝗬`,

`•—»✨「𝗝𝗨𝗕𝗔𝗘𝗗_𝗔𝗛𝗠𝗘𝗗_𝗝𝗢𝗬」✨«—•
༆-✿ Prefix Event ༊࿐
╭•┄┅════❁🌺❁════┅┄•╮

___কি হবে এত মানুষের প্রিয় হয়ে__🦋🌻
__যদি আল্লাহ প্রিয় না হতে পারি__🙂🦋

╰•┄┅════❁🌺❁════┅┄•╯
𝐂𝐫𝐞𝐚𝐭𝐨𝐫 : 𝗠𝗗 𝗝𝗨𝗕𝗔𝗘𝗗 𝗔𝗛𝗠𝗘𝗗 𝗝𝗢𝗬`,

`•—»✨「𝗝𝗨𝗕𝗔𝗘𝗗_𝗔𝗛𝗠𝗘𝗗_𝗝𝗢𝗬」✨«—•
༆-✿ Prefix Event ༊࿐
╭•┄┅════❁🌺❁════┅┄•╮

—𝐒𝐮𝐩𝐞𝐫𝐦𝐚𝐧 𝐎𝐟 𝐓𝐡𝐞 𝐖𝐨𝐫𝐥𝐝—
—হযরত মুহাম্মদ (সা:)💚🌼

╰•┄┅════❁🌺❁════┅┄•╯
𝐂𝐫𝐞𝐚𝐭𝐨𝐫 : 𝗠𝗗 𝗝𝗨𝗕𝗔𝗘𝗗 𝗔𝗛𝗠𝗘𝗗 𝗝𝗢𝗬`
        ];

        const imageUrls = [
            "https://i.postimg.cc/ZR0SLZyy/received-104854222681538.jpg",
            "https://i.postimg.cc/CM3RdrW4/received-1077131053254543.jpg",
            "https://i.postimg.cc/mhWWRHpQ/received-1202913210365646.jpg",
            "https://i.postimg.cc/yxZCwPj1/received-179416495132916.jpg"
        ];

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        const randomImage = imageUrls[Math.floor(Math.random() * imageUrls.length)];

        const options = {
            caption: randomQuote,
            reply_to_message_id: msg.message_id,
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
            const response = await axios.get(randomImage, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data, 'utf-8');
            return await bot.sendPhoto(chatId, imageBuffer, options);
        } catch (error) {
            return await bot.sendMessage(chatId, randomQuote, {
                reply_to_message_id: msg.message_id,
                reply_markup: options.reply_markup
            });
        }
    }
};
