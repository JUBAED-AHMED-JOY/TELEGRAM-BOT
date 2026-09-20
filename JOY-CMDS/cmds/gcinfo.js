module.exports = {
    config: {
        name: "gcinfo",
        version: "1.0.0",
        role: 0,
        author: "Joy Ahmed",
        cooldown: 5,
        description: "Get detailed information about the Telegram group",
        usePrefix: true
    },

    onStart: async function ({ bot, chatId, msg }) {
        // প্রাইভেট চ্যাটে কমান্ডটি কাজ করবে না
        if (msg.chat.type === 'private') {
            return bot.sendMessage(chatId, "⚠️ <i>এই কমান্ডটি শুধুমাত্র টেলিগ্রাম গ্রুপ বা চ্যানেলে কাজ করবে!</i>", {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });
        }

        const loadingMsg = await bot.sendMessage(chatId, "⏳ <i>গ্রুপের তথ্য সংগ্রহ করা হচ্ছে...</i>", {
            parse_mode: 'HTML',
            reply_to_message_id: msg.message_id
        });

        try {
            // গ্রুপের বেসিক তথ্য ও মেম্বার কাউন্ট নেওয়া
            const chat = await bot.getChat(chatId);
            const memberCount = await bot.getChatMemberCount(chatId);
            const administrators = await bot.getChatAdministrators(chatId);

            // অ্যাডমিনদের লিস্ট তৈরি করা
            let adminList = "";
            administrators.forEach((admin, index) => {
                const name = admin.user.first_name || "User";
                const username = admin.user.username ? `@${admin.user.username}` : "No Username";
                adminList += `  ${index + 1}. <b>${name}</b> (${username})\n`;
            });

            // গ্রুপের ডিসক্রিপশন চেক করা
            const description = chat.description ? chat.description : "No description set";

            const infoText = 
`📊 <b><u>𝙶𝚁𝙾𝚄𝙿  𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝚃𝙸𝙾𝙽</u></b>

🏷️ <b>𝙶𝚛𝚘𝚞𝚙 𝙽𝚊𝚖𝚎:</b> <code>${chat.title}</code>
📌 <b>𝙶𝚛𝚘𝚞𝚙 𝙸𝙳 (𝚃𝙸𝙳):</b> <code>${chatId}</code>
👥 <b>𝚃𝚘𝚝𝚊𝚕 𝙼𝚎𝚖𝚋𝚎𝚛𝚜:</b> <code>${memberCount}</code>
👑 <b>𝙰𝚍𝚖𝚒𝚗𝚜 𝙲𝚘𝚞𝚗𝚝:</b> <code>${administrators.length}</code>

📄 <b><u>𝙳𝚎𝚜𝚌𝚛𝚒𝚙𝚝𝚒𝚘𝚗:</u></b>
<i>${description}</i>

🛡️ <b><u>𝙰𝚍𝚖𝚒𝚗𝚒𝚜𝚝𝚛𝚊𝚝𝚘𝚛𝚜:</u></b>
${adminList}
👑 <b>𝙾𝚯𝚗𝚎𝚛:</b> <b><u>𝙹𝚘𝚢 𝙰𝚑𝚖𝚎𝚍</u></b>`;

            // যদি গ্রুপের প্রোফাইল পিকচার থাকে তবে ছবি সহ সেন্ড করবে
            if (chat.photo) {
                const photoFile = await bot.getFileLink(chat.photo.big_file_id);
                
                await bot.sendPhoto(chatId, photoFile, {
                    caption: infoText,
                    parse_mode: 'HTML',
                    reply_to_message_id: msg.message_id
                });
                
                return await bot.deleteMessage(chatId, loadingMsg.message_id);
            }

            // ছবি না থাকলে শুধু মেসেজ পাঠাবে
            await bot.editMessageText(infoText, {
                chat_id: chatId,
                message_id: loadingMsg.message_id,
                parse_mode: 'HTML'
            });

        } catch (err) {
            console.error('GC Info Error:', err.message);
            return bot.editMessageText(`❌ <i>গ্রুপ ইনফো সংগ্রহ করতে সমস্যা হয়েছে!</i>\n<b>Error:</b> <code>${err.message}</code>`, {
                chat_id: chatId,
                message_id: loadingMsg.message_id,
                parse_mode: 'HTML'
            });
        }
    }
};
