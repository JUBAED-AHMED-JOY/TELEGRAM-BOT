const config = require('../../config.json');

module.exports = {
    config: {
        name: 'owner_mention',
        author: 'JOY AHMED'
    },

    handleEvent: async function ({ event, bot }) {
        const msg = event.msg;

        // মেসেজে টেক্সট ও এনটিটি না থাকলে রিটার্ন
        if (!msg || !msg.text || !msg.entities) return;

        const ownerId = config.owner_id;
        const ownerUsername = config.owner_username ? config.owner_username.replace('@', '').toLowerCase() : '';

        // যদি ওনার নিজেই মেনশন পাঠায় তবে ইগনোর করবে
        if (msg.from && msg.from.id == ownerId) return;

        let isMentioned = false;

        for (const entity of msg.entities) {
            // ১. যদি Username দিয়ে ট্যাগ করে (@JOY_AHMED_88)
            if (entity.type === 'mention') {
                const mentionedText = msg.text.substring(entity.offset, entity.offset + entity.length).toLowerCase().replace('@', '');
                if (ownerUsername && mentionedText === ownerUsername) {
                    isMentioned = true;
                    break;
                }
            }

            // ২. যদি আইডি দিয়ে টেক্সট ট্যাগ করে
            if (entity.type === 'text_mention' && entity.user && entity.user.id == ownerId) {
                isMentioned = true;
                break;
            }
        }

        // ৩. যদি মেসেজটিতে ওনারকে পাওয়া যায় তবে রিপ্লাই দেওয়া হবে
        if (isMentioned) {
            const replyText = 
`⚡ ━━━ ❪ 𝗦𝗧𝗔𝗧𝗨𝗦 𝗨𝗣𝗗𝗔𝗧𝗘 ❫ ━━━ ⚡

╭───────────❍
│ 👤 𝗛𝗲𝘆, 𝗬𝗼𝘂 𝗺𝗲𝗻𝘁𝗶𝗼𝗻𝗲𝗱 𝗝𝗼𝘆 𝗕𝗼𝘀𝘀!
├───────────
│ ⚠️ 𝗝𝗼𝘆 𝗕𝗼𝘀𝘀 𝗕𝘂𝘀𝘆 𝗔𝗰𝗵𝗲!
│ ⏳ 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁, 𝗵𝗲 𝘄𝗶𝗹𝗹 
│    𝗰𝗼𝗻𝘁𝗮𝗰𝘁 𝘆𝗼𝘂 𝘀𝗼𝗼𝗻.
╰───────────❍

✨ 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 𝗝𝗢𝗬 𝗔𝗛𝗠𝗘𝗗 ✨`;

            try {
                await bot.sendMessage(msg.chat.id, replyText, {
                    reply_to_message_id: msg.message_id,
                    parse_mode: 'Markdown'
                });
            } catch (err) {
                console.error("Error in owner mention reply:", err.message);
            }
        }
    }
};
