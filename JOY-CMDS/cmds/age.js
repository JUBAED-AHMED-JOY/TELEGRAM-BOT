module.exports = {
    config: {
        name: 'age',
        author: 'JOY',
        aliases: ['agecalc', 'calculateage'],
        role: 0,
        cooldown: 3,
        description: 'Calculate your exact age based on date of birth',
        usePrefix: true
    },

    async onStart({ bot, chatId, msg, args }) {
        const messageId = msg ? msg.message_id : undefined;

        if (!args.length) {
            return bot.sendMessage(chatId, "⚠️ আপনার জন্মতারিখ লিখুন!\n\nউদাহরণ: `/age 15/08/2002` অথবা `/age 2002-08-15`", {
                reply_to_message_id: messageId,
                parse_mode: 'Markdown'
            });
        }

        const input = args[0].replace(/-/g, '/');
        const parts = input.split('/');

        let day, month, year;

        // তারিখ ডিটেক্ট করা (DD/MM/YYYY অথবা YYYY/MM/DD)
        if (parts.length === 3) {
            if (parts[0].length === 4) {
                // YYYY/MM/DD
                year = parseInt(parts[0]);
                month = parseInt(parts[1]) - 1;
                day = parseInt(parts[2]);
            } else {
                // DD/MM/YYYY
                day = parseInt(parts[0]);
                month = parseInt(parts[1]) - 1;
                year = parseInt(parts[2]);
            }
        }

        const birthDate = new Date(year, month, day);

        // ভ্যালিড তারিখ চেক
        if (isNaN(birthDate.getTime()) || day < 1 || day > 31 || month < 0 || month > 11) {
            return bot.sendMessage(chatId, "❌ জন্মতারিখটি সঠিক নয়! দয়া করে সঠিক দিন/মাস/বছর দিয়ে চেষ্টা করুন।\nযেমন: `/age 15/08/2002`", {
                reply_to_message_id: messageId,
                parse_mode: 'Markdown'
            });
        }

        const today = new Date();

        if (birthDate > today) {
            return bot.sendMessage(chatId, "⚠️ জন্মতারিখ ভবিষ্যতের হতে পারে না!", {
                reply_to_message_id: messageId
            });
        }

        // বয়স হিসাব করা
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();

        if (days < 0) {
            months--;
            const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += lastMonth.getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        const senderName = msg.from ? msg.from.first_name : 'User';

        const ageText = 
`⚡ ━━━ ❪ 𝗔𝗚𝗘 𝗖𝗔𝗟𝗖𝗨𝗟𝗔𝗧𝗢𝗥 ❫ ━━━ ⚡

╭───────────❍
│ 👤 𝗡𝗮𝗺𝗲     : ${senderName}
│ 🎂 𝗗.𝗢.𝗕    : ${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}
├───────────
│ ⏳ 𝗬𝗲𝗮𝗿𝘀   : ${years} Years
│ 📅 𝗠𝗼𝗻𝘁𝗵𝘀  : ${months} Months
│ 🗓️ 𝗗𝗮𝘆𝘀    : ${days} Days
╰───────────❍

✨ 𝘠𝘰𝘶𝘳 𝘌𝘹𝘢𝘤𝘵 𝘈𝘨𝘦 𝘊𝘢𝘭𝘤𝘶𝘭𝘢𝘵𝘦𝘥! ✨`;

        return bot.sendMessage(chatId, ageText, {
            reply_to_message_id: messageId
        });
    }
};
