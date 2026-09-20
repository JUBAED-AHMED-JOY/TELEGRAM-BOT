module.exports = {
    config: {
        name: "ban",
        version: "1.0.0",
        role: 2, // 2 =  Bot Owner Only
        author: "Joy Ahmed",
        cooldown: 3,
        description: "Permanently ban a user from the group",
        usePrefix: true
    },

    onStart: async function ({ bot, chatId, args, msg, config }) {
        const prefix = config.prefix || '/';

        // ১. প্রাইভেট চ্যাটে কমান্ডটি কাজ করবে না
        if (msg.chat.type === 'private') {
            return bot.sendMessage(chatId, "⚠️ <i>এই কমান্ডটি শুধুমাত্র গ্রুপে কাজ করবে!</i>", {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });
        }

        let targetUserId = null;
        let targetUserName = "";

        // ২. যদি মেসেজে রিপ্লাই দিয়ে /ban দেওয়া হয়
        if (msg.reply_to_message) {
            targetUserId = msg.reply_to_message.from.id;
            targetUserName = msg.reply_to_message.from.first_name || "User";
        } 
        // ৩. যদি User ID বা Username দিয়ে /ban <ID/@username> দেওয়া হয়
        else if (args[0]) {
            const input = args[0].trim();
            if (input.startsWith('@')) {
                try {
                    const chatMember = await bot.getChatMember(chatId, input);
                    targetUserId = chatMember.user.id;
                    targetUserName = chatMember.user.first_name || "User";
                } catch (e) {
                    return bot.sendMessage(chatId, `❌ <i>ইউজার খুঁজে পাওয়া যায়নি! নিশ্চিত করুন ইউজারটি গ্রুপে আছে।</i>`, {
                        parse_mode: 'HTML',
                        reply_to_message_id: msg.message_id
                    });
                }
            } else if (!isNaN(input)) {
                targetUserId = parseInt(input);
                targetUserName = `User (${targetUserId})`;
            }
        }

        // টার্গেট ইউজার না পাওয়া গেলে হেল্প ড্যাশবোর্ড
        if (!targetUserId) {
            const usageText = 
`⚠️ <b><u>𝙱𝙰𝙽  𝙲𝙾𝙼𝙼𝙰𝙽𝙳  𝚄𝚂𝙰𝙶𝙴</u></b>

👉 <b>যেকোনো মেম্বারকে ব্যান করতে:</b>
• মেসেজে রিপ্লাই করে লিখুন: <code>${prefix}ban</code>
• User ID দিয়ে লিখুন: <code>${prefix}ban 123456789</code>
• Username দিয়ে লিখুন: <code>${prefix}ban @username</code>`;

            return bot.sendMessage(chatId, usageText, {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });
        }

        // ৪. বট ওনার বা নিজেকে ব্যান করা থেকে সুরক্ষা
        if (targetUserId === bot.id) {
            return bot.sendMessage(chatId, "⚠️ <i>আমি নিজেকে নিজে ব্যান করতে পারব না!</i>", {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });
        }

        try {
            // ৫. পারমানেন্ট ব্যান (unbanChatMember না করায় ইউজার আর জয়েন করতে পারবে না)
            await bot.banChatMember(chatId, targetUserId);

            const successText = 
`🚫 ═════════════════ 🚫
  🛑  <b><u>𝚄𝚂𝙴𝚁  𝙱𝙰𝙽𝙽𝙴𝙳</u></b>
🚫 ═════════════════ 🚫

👤 <b>𝙽𝚊𝚖𝚎:</b> <b>${targetUserName}</b>
📌 <b>𝚄𝚜𝚎𝚛 𝙸𝙳:</b> <code>${targetUserId}</code>
👑 <b>𝙰𝚌𝚝𝚒𝚘𝚗 𝙱𝚢:</b> <b><u>${msg.from.first_name}</u></b>
❇️ <b>𝚂𝚝𝚊𝚝𝚞𝚜:</b> <i>Permanently banned from the group!</i>`;

            return bot.sendMessage(chatId, successText, {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });

        } catch (err) {
            console.error('Ban Command Error:', err.message);
            return bot.sendMessage(chatId, `❌ <i>মেম্বারকে ব্যান করা সম্ভব হয়নি!</i>\n<b>কারণ:</b> বটকে অবশ্যই গ্রুপের <b>Admin Permission</b> (Ban Users) দিতে হবে।`, {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });
        }
    }
};
