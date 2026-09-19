module.exports = {
    config: {
        name: "adduser",
        version: "1.0.0",
        role: 1, // 1 = Group Admin & Bot Owner
        author: "Joy Ahmed",
        cooldown: 5,
        description: "Add user to group by ID or username",
        usePrefix: true
    },

    onStart: async function ({ bot, chatId, args, msg, config }) {
        const prefix = config.prefix || '/';

        // প্রাইভেট চ্যাটে কাজ করবে না
        if (msg.chat.type === 'private') {
            return bot.sendMessage(chatId, '❌ <i>এই কমান্ডটি শুধুমাত্র গ্রুপে ব্যবহার করা যাবে!</i>', {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });
        }

        // ইউজার আইডি বা ইউজারনেম ইনপুট না দিলে
        if (!args[0]) {
            return bot.sendMessage(chatId, `⚠️ <b><u>𝙸𝙽𝚅𝙰𝙻𝙸𝙳 𝚄𝚂𝙰𝙶𝙴</u></b>\n\n👉 <b>ইউজার আইডি দিয়ে:</b> <code>${prefix}adduser 123456789</code>\n👉 <b>ইউজারনেম দিয়ে:</b> <code>${prefix}adduser @username</code>`, {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });
        }

        let input = args[0].trim();

        try {
            let targetUserId = input;

            // যদি ইউজারনেম দেওয়া হয় (@username)
            if (input.startsWith('@')) {
                const chatMember = await bot.getChat(input);
                targetUserId = chatMember.id;
            }

            // গ্রুপে অ্যাড করার চেষ্টা
            await bot.approveChatJoinRequest(chatId, targetUserId); // জয়েন রিকুয়েস্ট থাকলে এপ্রুভ করবে

            const successText = 
`✨ ═════════════════ ✨
  🎉  <b><u>𝚄𝚂𝙴𝚁 𝙰𝙳𝙳𝙴𝙳 𝚂𝚄𝙲𝙲𝙴𝚂𝚂𝙵𝚄𝙻𝙻𝚈</u></b>
✨ ═════════════════ ✨

👤 <b>𝚄𝚜𝚎𝚛 𝙸𝙳:</b> <code>${targetUserId}</code>
👑 <b>𝙰𝚍𝚍𝚎𝚍 𝙱𝚢:</b>  <b><u>𝙹𝚘𝚢 𝙰𝚑𝚖𝚎𝚍</u></b>`;

            await bot.sendMessage(chatId, successText, {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });

        } catch (err) {
            console.error('Adduser Error:', err.message);

            // কোনো ইউজারের চ্যাট আইডি সরাসরি গ্রুপে ইনভাইট করতে সমস্যা হলে ইনভাইট লিংক তৈরি করবে
            try {
                const inviteLink = await bot.exportChatInviteLink(chatId);
                const fallbackText = 
`⚠️ <b><u>𝙰𝙳𝙳 𝚄𝚂𝙴𝚁 𝙽𝙾𝚃𝙸𝙲𝙴</u></b>

❌ <i>টেলিগ্রাম প্রাইভেসি বা বট পারমিশনের কারণে ইউজারকে সরাসরি যুক্ত করা যায়নি।</i>

🔗 <b>Group Invite Link:</b>
${inviteLink}`;

                return bot.sendMessage(chatId, fallbackText, {
                    reply_to_message_id: msg.message_id
                });
            } catch (linkErr) {
                return bot.sendMessage(chatId, '❌ <i>ইউজারকে অ্যাড করতে ব্যর্থ হয়েছে। নিশ্চিত করুন বটের <b>Add Members</b> পারমিশন আছে।</i>', {
                    parse_mode: 'HTML',
                    reply_to_message_id: msg.message_id
                });
            }
        }
    }
};
