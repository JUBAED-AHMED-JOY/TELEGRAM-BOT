module.exports = {
    config: {
        name: 'leave',
        author: 'JOY AHMED'
    },

    handleEvent: async function ({ event, bot }) {
        const msg = event.msg;

        // মেসেজে কোনো সদস্য লিভ বা রিমুভ হয়েছে কিনা চেক করা
        if (!msg || !msg.left_chat_member) return;

        const chatId = msg.chat.id;
        const groupTitle = msg.chat.title || "Our Group";
        const leftMember = msg.left_chat_member;

        // বট নিজেকে রিমুভ করা হলে নোটিফিকেশন পাঠাবে না
        const botInfo = await bot.getMe();
        if (leftMember.id === botInfo.id) return;

        const name = leftMember.first_name || 'Member';
        const username = leftMember.username ? `@${leftMember.username}` : name;
        const targetUserId = leftMember.id;

        // ১. গ্রুপে অবশিষ্ট মোট মেম্বার সংখ্যা গণনা
        let memberCount = "N/A";
        try {
            const count = await bot.getChatMemberCount(chatId);
            memberCount = `${count} Members`;
        } catch (err) {
            console.error("Member count error on leave:", err.message);
        }

        // ২. জয় আহমেদ স্টাইল টেক্সট
        const leaveText = 
`⚡ ━━━ ❪ 𝗠𝗘𝗠𝗕𝗘𝗥 𝗟𝗘𝗙𝗧 𝗚𝗥𝗢𝗨𝗣 ❫ ━━━ ⚡

╭───────────❍
│ 👋 𝗚𝗼𝗼𝗱𝗯𝘆𝗲   : ${name} (${username})
│ 🆔 𝗨𝘀𝗲𝗿 𝗜𝗗 : \`${targetUserId}\`
│ 🏰 𝗚𝗿𝗼𝘂𝗽   : ${groupTitle}
│ 📊 𝗥𝗲𝗺𝗮𝗶𝗻𝗶𝗻𝗴: ${memberCount}
├───────────
│ 💔 We are sad to see you leave!
│ 🚪 Hope you come back soon.
╰───────────❍

✨ 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 𝗝𝗢𝗬 𝗔𝗛𝗠𝗘𝗗 ✨`;

        try {
            await bot.sendMessage(chatId, leaveText, {
                parse_mode: 'Markdown'
            });
        } catch (err) {
            console.error("Error sending leave message:", err.message);
        }
    }
};
