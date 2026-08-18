module.exports = {
    config: {
        name: 'id',
        author: 'JOY',
        role: 0,
        cooldown: 3,
        description: 'Get User, Group, or Channel ID via Buttons',
        usePrefix: true
    },

    async onStart({ bot, chatId, msg, globalHandleButton }) {
        const messageId = msg ? msg.message_id : undefined;

        const captionText = 
`⚡ ━━━ ❪ 𝗜𝗗 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 ❫ ━━━ ⚡

╭───────────❍
│ 🆔 𝗖𝗵𝗼𝗼𝘀𝗲 𝗮𝗻 𝗼𝗽𝘁𝗶𝗼𝗻 𝗯𝗲𝗹𝗼𝘄
│ 💡 𝗖𝗹𝗶𝗰𝗸 𝗮 𝗯𝘂𝘁𝘁𝗼𝗻 𝘁𝗼 𝗴𝗲𝘁 𝗜𝗗
╰───────────❍`;

        const sentMsg = await bot.sendMessage(chatId, captionText, {
            reply_to_message_id: messageId,
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '👤 User ID', callback_data: 'get_user_id' },
                        { text: '👥 Group ID', callback_data: 'get_group_id' }
                    ],
                    [
                        { text: '📢 Channel ID', callback_data: 'get_channel_id' }
                    ]
                ]
            }
        });

        // Callback Query (Button click) হ্যান্ডলার
        if (globalHandleButton) {
            globalHandleButton.push({
                messageID: sentMsg.message_id,
                userId: msg.from.id,
                chatId: chatId,
                handleButton: async function({ bot, event }) {
                    const buttonType = event.button;
                    const targetChatId = event.threadId;

                    if (buttonType === 'get_user_id') {
                        return bot.sendMessage(targetChatId, `👤 𝗬𝗼𝘂𝗿 𝗨𝘀𝗲𝗿 𝗜𝗗: \`${msg.from.id}\``, { parse_mode: 'Markdown' });
                    }

                    if (buttonType === 'get_group_id') {
                        if (msg.chat.type === 'private') {
                            return bot.sendMessage(targetChatId, `⚠️ এটি প্রাইভেট চ্যাট! গ্রুপ ইনফো পেতে গ্রুপে কমান্ডটি টাইপ করুন।`);
                        }
                        return bot.sendMessage(targetChatId, `👥 𝗚𝗿𝗼𝘂𝗽 𝗜𝗗: \`${msg.chat.id}\``, { parse_mode: 'Markdown' });
                    }

                    if (buttonType === 'get_channel_id') {
                        return bot.sendMessage(
                            targetChatId, 
                            `📢 𝗖𝗵𝗮𝗻𝗻𝗲𝗹 𝗜𝗗 পাওয়ার উপায়:\n\n১. চ্যানেল থেকে যেকোনো একটি পোস্ট বটের চ্যাটে Forward করে দিন।\n২. অথবা বটকে চ্যানেলে Admin বানিয়ে মেসেজ দিন।`
                        );
                    }
                }
            });
        }
    }
};
