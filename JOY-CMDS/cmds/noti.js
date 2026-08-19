const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: 'noti',
        author: 'JOY',
        aliases: ['notification', 'broadcast'],
        role: 2, // শুধুমাত্র বট অ্যাডমিন নোটিফিকেশন দিতে পারবে
        cooldown: 10,
        description: 'Send broadcast notification to all users and groups',
        usePrefix: true
    },

    async onStart({ bot, chatId, msg, args }) {
        const messageId = msg ? msg.message_id : undefined;

        if (!args.length) {
            return bot.sendMessage(chatId, "⚠️ ব্রডকাস্ট করার জন্য মেসেজটি লিখুন!\n\nউদাহরণ: `/noti আমাদের বটে নতুন আপডেট যোগ করা হয়েছে!`", {
                reply_to_message_id: messageId,
                parse_mode: 'Markdown'
            });
        }

        const notiText = args.join(" ");

        const chatGroupsFile = path.join(__dirname, '..', '..', 'chatGroups.json');
        const userDataFile = path.join(__dirname, '..', '..', 'userData.json');

        let chatGroups = [];
        let userData = {};

        if (fs.existsSync(chatGroupsFile)) {
            try { chatGroups = JSON.parse(fs.readFileSync(chatGroupsFile, 'utf8')); } catch {}
        }

        if (fs.existsSync(userDataFile)) {
            try { userData = JSON.parse(fs.readFileSync(userDataFile, 'utf8')); } catch {}
        }

        const userIds = Object.keys(userData);

        const progressMsg = await bot.sendMessage(chatId, "⏳ নোটিফিকেশন পাঠানো শুরু হচ্ছে...", {
            reply_to_message_id: messageId
        });

        const formattedNoti = 
`⚡ ━━━ ❪ 📢 𝗔𝗡𝗡𝗢𝗨𝗡𝗖𝗘𝗠𝗘𝗡𝗧 📢 ❫ ━━━ ⚡

╭───────────❍
│ ${notiText}
╰───────────❍

✨ 𝘚𝘦𝘯𝘵 𝘣𝘺 𝘉𝘰𝘵 𝘈𝘥𝘮𝘪𝘯 ✨`;

        let successUserCount = 0;
        let successGroupCount = 0;
        let failedCount = 0;

        // ১. সব ইনবক্স ইউজারদের মেসেজ পাঠানো
        for (const uId of userIds) {
            try {
                await bot.sendMessage(uId, formattedNoti);
                successUserCount++;
                await new Promise(resolve => setTimeout(resolve, 50)); // Telegram Limit handling
            } catch (err) {
                failedCount++;
            }
        }

        // ২. সব গ্রুপে মেসেজ পাঠানো
        for (const gId of chatGroups) {
            try {
                await bot.sendMessage(gId, formattedNoti);
                successGroupCount++;
                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (err) {
                failedCount++;
            }
        }

        await bot.deleteMessage(chatId, progressMsg.message_id).catch(() => {});

        const resultText = 
`⚡ ━━━ ❪ 📢 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗦𝗘𝗡𝗧 ❫ ━━━ ⚡

╭───────────❍
│ ✅ 𝗨𝘀𝗲𝗿 𝗜𝗻𝗯𝗼𝘅  : ${successUserCount} জন
│ ✅ 𝗚𝗿𝗼𝘂𝗽𝘀      : ${successGroupCount} টি
│ ❌ 𝗙𝗮𝗶𝗹𝗲𝗱      : ${failedCount} টি
╰───────────❍

✨ 𝘉𝘳𝘰𝘢𝘥𝘤𝘢𝘴𝘵 𝘊𝘰𝘮𝘱𝘭𝘦𝘵𝘦𝘥! ✨`;

        return bot.sendMessage(chatId, resultText, {
            reply_to_message_id: messageId
        });
    }
};
