module.exports = {
    config: {
        name: 'all',
        author: 'JOY AHMED',
        aliases: ['tagall', 'everyone', 'mentionall'],
        role: 1, // শুধুমাত্র গ্রুপ অ্যাডমিন বা বট ওনার ব্যবহার করতে পারবে
        cooldown: 10,
        description: 'Mention all active group members with a message',
        usePrefix: true
    },

    async onStart({ bot, chatId, msg, args }) {
        const messageId = msg ? msg.message_id : undefined;

        // প্রাইভেট চ্যাটে কমান্ডটি চেক করা
        if (msg.chat.type === 'private') {
            return bot.sendMessage(chatId, "⚠️ এই কমান্ডটি শুধুমাত্র গ্রুপে ব্যবহার করা যাবে!", {
                reply_to_message_id: messageId
            });
        }

        const customMessage = args.length ? args.join(" ") : "Attention Everyone!";

        try {
            // গ্রুপের মেম্বার ও অ্যাডমিন তথ্য নিয়ে আসা
            const admins = await bot.getChatAdministrators(chatId);
            
            let mentionText = 
`⚡ ━━━ ❪ 📢 𝗔𝗧𝗧𝗘𝗡𝗧𝗜𝗢𝗡 𝗘𝗩𝗘𝗥𝗬𝗢𝗡𝗘 📢 ❫ ━━━ ⚡

╭───────────❍
│ 💬 **Message:** ${customMessage}
╰───────────❍

✨ **Mentioning Admins & Active Members:**\n\n`;

            // টেলিগ্রাম বট API দিয়ে সরাসরি প্রমোট করা অ্যাডমিনদের লিস্ট পাওয়া সহজ
            let count = 1;
            for (const admin of admins) {
                if (admin.user.is_bot) continue; // বটদের মেনশন করবে না
                
                const name = admin.user.first_name || 'Member';
                mentionText += `${count}. [${name}](tg://user?id=${admin.user.id})\n`;
                count++;
            }

            mentionText += `\n✨ 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 𝗝𝗢𝗬 𝗔𝗛𝗠𝗘𝗗 ✨`;

            return await bot.sendMessage(chatId, mentionText, {
                reply_to_message_id: messageId,
                parse_mode: 'Markdown'
            });

        } catch (error) {
            console.error("Tag All Error:", error.message);
            return bot.sendMessage(chatId, "❌ সবাইকে মেনশন করতে সমস্যা হয়েছে! বটকে গ্রুপে Admin পারমিশন দিন।", {
                reply_to_message_id: messageId
            });
        }
    }
};
