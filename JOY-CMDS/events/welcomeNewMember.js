const axios = require('axios');

module.exports = {
    config: {
        name: 'welcome',
        author: 'JOY AHMED'
    },

    handleEvent: async function ({ event, bot }) {
        const msg = event.msg;

        // মেসেজে নতুন মেম্বার যুক্ত হয়েছে কিনা চেক করা
        if (!msg || !msg.new_chat_members || msg.new_chat_members.length === 0) return;

        const chatId = msg.chat.id;
        const groupTitle = msg.chat.title || "Our Group";

        for (const newMember of msg.new_chat_members) {
            // বট নিজে জয়েন করলে ওয়েলকাম জেনারেট করবে না
            if (newMember.is_bot) continue;

            const name = newMember.first_name || 'Member';
            const username = newMember.username ? `@${newMember.username}` : name;
            const targetUserId = newMember.id;

            // ১. গ্রুপে মোট মেম্বার সংখ্যা গণনা
            let memberCount = "N/A";
            try {
                const count = await bot.getChatMemberCount(chatId);
                memberCount = `${count}th Member`;
            } catch (err) {
                console.error("Member count error:", err.message);
            }

            // ২. কাস্টম ইমাজ জেনারেটর এপিআই লিংক (নাম, গ্রুপের নাম ও মেম্বার নম্বর দিয়ে)
            const encodedName = encodeURIComponent(name);
            const encodedGroup = encodeURIComponent(groupTitle);
            const encodedMember = encodeURIComponent(`You are the ${memberCount}`);

            const generatedImageUrl = `https://api.popcat.xyz/welcomecard?background=https://i.ibb.co/3S4Sgsc/welcome-bg.jpg&text1=${encodedName}&text2=WELCOME+TO+${encodedGroup}&text3=${encodedMember}`;

            // ৩. জয় আহমেদ স্টাইল টেক্সট
            const welcomeText = 
`⚡ ━━━ ❪ 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗧𝗢 𝗚𝗥𝗢𝗨𝗣 ❫ ━━━ ⚡

╭───────────❍
│ 👋 𝗛𝗲𝗹𝗹𝗼    : ${name} (${username})
│ 🆔 𝗨𝘀𝗲𝗿 𝗜𝗗 : \`${targetUserId}\`
│ 🏰 𝗚𝗿𝗼𝘂𝗽   : ${groupTitle}
│ 🔢 𝗠𝗲𝗺𝗯𝗲𝗿  : You are the ${memberCount}!
├───────────
│ 💖 Welcome to our awesome community! 
│ 📜 Please follow all group rules properly.
╰───────────❍

✨ 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 𝗝𝗢𝗬 𝗔𝗛𝗠𝗘𝗗 ✨`;

            try {
                // জেনারেট হওয়া ওয়েলকাম কার্ড ইমেজ পাঠানো
                const response = await axios.get(generatedImageUrl, { responseType: 'arraybuffer' });
                const imageBuffer = Buffer.from(response.data, 'utf-8');

                await bot.sendPhoto(chatId, imageBuffer, {
                    caption: welcomeText,
                    parse_mode: 'Markdown'
                });
            } catch (err) {
                // ইমেজ জেনারেট কোনো কারণে ফেল করলে ব্যাকআপ টেক্সট পাঠানো
                await bot.sendMessage(chatId, welcomeText, {
                    parse_mode: 'Markdown'
                });
            }
        }
    }
};
