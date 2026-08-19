module.exports = {
    config: {
        name: 'callad',
        author: 'JOY',
        aliases: ['calladmin', 'report'],
        role: 0,
        cooldown: 10,
        description: 'Send a direct message or report to the Bot Admin',
        usePrefix: true
    },

    async onStart({ bot, chatId, msg, args, config }) {
        const messageId = msg ? msg.message_id : undefined;
        const ownerId = config ? config.owner_id : null;

        // ১. অ্যাডমিন আইডি আছে কিনা চেক করা
        if (!ownerId) {
            return bot.sendMessage(chatId, "⚠️ অ্যাডমিন আইডি সেট করা নেই! `config.json` ফাইলে `owner_id` যুক্ত করুন।", {
                reply_to_message_id: messageId
            });
        }

        // ২. মেসেজ বা বিবরণ দেওয়া হয়েছে কিনা চেক
        if (!args.length) {
            return bot.sendMessage(chatId, "⚠️ অ্যাডমিনের কাছে পাঠানোর জন্য কোনো মেসেজ টাইপ করুন।\n\nযেমন: `/callad বটে সমস্যা হচ্ছে!`", {
                reply_to_message_id: messageId
            });
        }

        const userMessage = args.join(" ");
        const sender = msg.from;
        const senderName = `${sender.first_name || ''} ${sender.last_name || ''}`.trim();
        const chatType = msg.chat.type === 'private' ? 'Private Chat' : `Group (${msg.chat.title || 'Unknown'})`;

        // ৩. অ্যাডমিনের কাছে যে ফরম্যাটে মেসেজ যাবে
        const adminNotification = 
`⚡ ━━━ ❪ 𝗡𝗘𝗪 𝗨𝗦𝗘𝗥 𝗥𝗘𝗣𝗢𝗥𝗧 ❫ ━━━ ⚡

╭───────────❍
│ 👤 𝗦𝗲𝗻𝗱𝗲𝗿   : ${senderName}
│ 🆔 𝗨𝘀𝗲𝗿 𝗜𝗗  : \`${sender.id}\`
│ 💬 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲 : ${sender.username ? '@' + sender.username : 'None'}
│ 📍 𝗖𝗵𝗮𝘁      : ${chatType}
├───────────
│ 📝 𝗠𝗲𝘀𝘀𝗮𝗴𝗲 :
│ "${userMessage}"
╰───────────❍

✨ 𝘙𝘦𝘱𝘰𝘳𝘵 𝘍𝘰𝘳𝘸𝘢𝘳𝘥𝘦𝘥 𝘷𝘪𝘢 𝘊𝘢𝘭𝘭𝘈𝘥 𝘊𝘰𝘮𝘮𝘢𝘯𝘥 ✨`;

        try {
            // অ্যাডমিনের ইনবক্সে মেসেজ ফরোয়ার্ড করা
            await bot.sendMessage(ownerId, adminNotification, { parse_mode: 'Markdown' });

            // ইউজারকে কনফার্মেশন মেসেজ পাঠানো
            const successMsg = 
`⚡ ━━━ ❪ 𝗠𝗘𝗦𝗦𝗔𝗚𝗘 𝗦𝗘𝗡𝗧 ❫ ━━━ ⚡

╭───────────❍
│ ✅ আপনার মেসেজটি সফলভাবে অ্যাডমিন
│    এর কাছে পাঠিয়ে দেওয়া হয়েছে!
╰───────────❍`;

            return await bot.sendMessage(chatId, successMsg, {
                reply_to_message_id: messageId
            });

        } catch (error) {
            console.error("Callad Command Error:", error.message);
            return bot.sendMessage(chatId, "❌ অ্যাডমিনের কাছে মেসেজ পাঠানো সম্ভব হয়নি! (নিশ্চিত করুন অ্যাডমিন বটটি স্টার্ট করেছে)।", {
                reply_to_message_id: messageId
            });
        }
    }
};
