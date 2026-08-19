module.exports = {
    config: {
        name: 'pp',
        author: 'JOY',
        aliases: ['dp', 'avatar'],
        role: 0,
        cooldown: 5,
        description: 'Get user profile picture (self, reply, or mention)',
        usePrefix: true
    },

    async onStart({ bot, chatId, msg }) {
        const messageId = msg ? msg.message_id : undefined;
        let targetUser = msg.from; // ডিফল্ট নিজের প্রোফাইল পিকচার

        // ১. যদি কাউকে মেসেজে রিপ্লাই দেওয়া হয়
        if (msg.reply_to_message && msg.reply_to_message.from) {
            targetUser = msg.reply_to_message.from;
        } 
        // ২. যদি মেসেজে কাউকে মেনশন বা এন্টেটি দেওয়া হয়
        else if (msg.entities) {
            const mentionEntity = msg.entities.find(e => e.type === 'mention' || e.type === 'text_mention');
            if (mentionEntity) {
                if (mentionEntity.type === 'text_mention' && mentionEntity.user) {
                    targetUser = mentionEntity.user;
                } else if (mentionEntity.type === 'mention') {
                    const username = msg.text.substring(mentionEntity.offset, mentionEntity.offset + mentionEntity.length);
                    try {
                        const chatMember = await bot.getChatMember(chatId, username);
                        if (chatMember && chatMember.user) {
                            targetUser = chatMember.user;
                        }
                    } catch (err) {
                        return bot.sendMessage(chatId, `❌ ইউজার আইডি বা প্রোফাইল খুঁজে পাওয়া যায়নি!`, {
                            reply_to_message_id: messageId
                        });
                    }
                }
            }
        }

        try {
            // ইউজারের প্রোফাইল ফটো ফেচ করা
            const photos = await bot.getUserProfilePhotos(targetUser.id, { limit: 1 });

            if (!photos || photos.total_count === 0) {
                return bot.sendMessage(chatId, `⚠️ **${targetUser.first_name}**-এর কোনো প্রোফাইল পিকচার পাওয়া যায়নি!`, {
                    reply_to_message_id: messageId,
                    parse_mode: 'Markdown'
                });
            }

            // সবচেয়ে হাই কোয়ালিটি ছবি সিলেক্ট করা
            const fileId = photos.photos[0][photos.photos[0].length - 1].file_id;

            const captionText = 
`⚡ ━━━ ❪ 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 𝗣𝗜𝗖𝗧𝗨𝗥𝗘 ❫ ━━━ ⚡

╭───────────❍
│ 👤 𝗡𝗮𝗺𝗲 : ${targetUser.first_name} ${targetUser.last_name || ''}
│ 🆔 𝗨𝘀𝗲𝗿 𝗜𝗗 : \`${targetUser.id}\`
╰───────────❍

✨ 𝘗𝘳𝘰𝘧𝘪𝘭𝘦 𝘗𝘪𝘤𝘵𝘶𝘳𝘦 𝘍𝘦𝘵𝘤𝘩𝘦𝘥! ✨`;

            return await bot.sendPhoto(chatId, fileId, {
                caption: captionText,
                reply_to_message_id: messageId,
                parse_mode: 'Markdown'
            });

        } catch (error) {
            console.error("PP Command Error:", error.message);
            return bot.sendMessage(chatId, "❌ প্রোফাইল পিকচার লোড করার সময় সমস্যা হয়েছে!", {
                reply_to_message_id: messageId
            });
        }
    }
};
