module.exports = {
    config: {
        name: "kick",
        version: "1.0.0",
        role: 1, // 1 = Group Admin & Bot Owner Only
        author: "Joy Ahmed",
        cooldown: 3,
        description: "Kick/Remove a user from the group",
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

        // ২. যদি মেসেজে রিপ্লাই দিয়ে /kick দেওয়া হয়
        if (msg.reply_to_message) {
            targetUserId = msg.reply_to_message.from.id;
            targetUserName = msg.reply_to_message.from.first_name || "User";
        } 
        // ৩. যদি User ID বা Username দিয়ে /kick <ID/@username> দেওয়া হয়
        else if (args[0]) {
            const input = args[0].trim();
            if (input.startsWith('@')) {
                // ইউজারনেম দিয়ে কিক করার চেষ্টা
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

        // টার্গেট ইউজার না পাওয়া গেলে সাহায্য পাঠানো
        if (!targetUserId) {
            const usageText = 
`⚠️ <b><u>𝙺𝙸𝙲𝙺  𝙲𝙾𝙼𝙼𝙰𝙽𝙳  𝚄𝚂𝙰𝙶𝙴</u></b>

👉 <b>যেকোনো মেম্বারকে কিক করতে:</b>
• মেসেজে রিপ্লাই করে লিখুন: <code>${prefix}kick</code>
• User ID দিয়ে লিখুন: <code>${prefix}kick 123456789</code>
• Username দিয়ে লিখুন: <code>${prefix}kick @username</code>`;

            return bot.sendMessage(chatId, usageText, {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });
        }

        // ৪. বট ওনার বা বটের নিজেকে কিক করা থেকে সুরক্ষা
        if (targetUserId === bot.id) {
            return bot.sendMessage(chatId, "⚠️ <i>আমি নিজেকে নিজে কিক করতে পারব না!</i>", {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });
        }

        try {
            // ৫. টেলিগ্রাম থেকে ইউজারকে কিক (Unban দিয়ে সাথে সাথে যেন চাইলে আবার জয়েন করতে পারে)
            await bot.banChatMember(chatId, targetUserId);
            await bot.unbanChatMember(chatId, targetUserId); // Kick effect: removes without permanent ban

            const successText = 
`👢 ═════════════════ 👢
  🛑  <b><u>𝚄𝚂𝙴𝚁  𝙺𝙸𝙲𝙺𝙴𝙳</u></b>
👢 ═════════════════ 👢

👤 <b>𝙽𝚊𝚖𝚎:</b> <b>${targetUserName}</b>
📌 <b>𝚄𝚜𝚎𝚛 𝙸𝙳:</b> <code>${targetUserId}</code>
👑 <b>𝙰𝚌𝚝𝚒𝚘𝚗 𝙱𝚢:</b> <b><u>${msg.from.first_name}</u></b>
❇️ <b>𝚂𝚝𝚊𝚝𝚞𝚜:</b> <i>Successfully removed from the group!</i>`;

            return bot.sendMessage(chatId, successText, {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });

        } catch (err) {
            console.error('Kick Command Error:', err.message);
            return bot.sendMessage(chatId, `❌ <i>মেম্বারকে কিক করা সম্ভব হয়নি!</i>\n<b>কারণ:</b> বটকে অবশ্যই গ্রুপের <b>Admin Permission</b> (Ban Users) দিতে হবে।`, {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });
        }
    }
};
