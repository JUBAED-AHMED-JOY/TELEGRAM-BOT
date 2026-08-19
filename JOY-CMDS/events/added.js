module.exports = {
    config: {
        name: 'added',
        author: 'JOY AHMED'
    },

    handleEvent: async function ({ event, bot }) {
        const msg = event.msg;

        // যদি মেসেজে নতুন মেম্বার জয়েনিং ইভেন্ট না থাকে, তবে রিটার্ন
        if (!msg || !msg.new_chat_members) return;

        // বট নিজের আইডি চেক করা
        const botInfo = await bot.getMe();
        const isBotAdded = msg.new_chat_members.some(member => member.id === botInfo.id);

        if (isBotAdded) {
            const chatId = msg.chat.id;
            const groupTitle = msg.chat.title || "Group";

            const addedText = 
`⚡ ━━━ ❪ 𝗕𝗢𝗧 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟𝗟𝗬 𝗔𝗗𝗗𝗘𝗗 ❫ ━━━ ⚡

╭───────────❍
│ ✅ 𝗛𝗲𝗹𝗹𝗼! 𝗜'𝗺 𝗮𝗰𝘁𝗶𝘃𝗲 𝗵𝗲𝗿𝗲.
│ 🏰 𝗚𝗿𝗼𝘂𝗽 : ${groupTitle}
│ 🤖 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲 : ${botInfo.first_name}
├───────────
│ 💡 𝗧𝘆𝗽𝗲 /help 𝘁𝗼 𝘀𝗲𝗲 𝗺𝘆 𝗰𝗺𝗱𝘀
│ 🛡️ 𝗧𝗵𝗮𝗻𝗸𝘀 𝗳𝗼𝗿 𝗮𝗱𝗱𝗶𝗻𝗴 𝗺𝗲!
╰───────────❍

✨ 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 𝗝𝗢𝗬 𝗔𝗛𝗠𝗘𝗗 ✨`;

            try {
                await bot.sendMessage(chatId, addedText, {
                    parse_mode: 'Markdown'
                });
            } catch (err) {
                console.error("Error sending bot added message:", err.message);
            }
        }
    }
};
