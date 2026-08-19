const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: 'file',
        author: 'JOY',
        aliases: ['cmdcode', 'getfile'],
        role: 2, // শুধুমাত্র বট অ্যাডমিন দেখতে পারবে
        cooldown: 3,
        description: 'Read and view command source code',
        usePrefix: true
    },

    async onStart({ bot, chatId, msg, args }) {
        const messageId = msg ? msg.message_id : undefined;

        if (!args.length) {
            return bot.sendMessage(chatId, "⚠️ ফাইল বা কমান্ডের নাম দিন!\n\nউদাহরণ: `/file start` বা `/file help.js`", {
                reply_to_message_id: messageId,
                parse_mode: 'Markdown'
            });
        }

        let fileName = args[0].trim();
        if (!fileName.endsWith('.js')) {
            fileName += '.js';
        }

        const filePath = path.join(__dirname, fileName);

        if (!fs.existsSync(filePath)) {
            return bot.sendMessage(chatId, `❌ **${fileName}** ফাইলটি খুঁজে পাওয়া যায়নি!`, {
                reply_to_message_id: messageId,
                parse_mode: 'Markdown'
            });
        }

        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');

            const captionHeader = 
`⚡ ━━━ ❪ 𝗦𝗢𝗨𝗥𝗖𝗘 𝗖𝗢𝗗𝗘 ❫ ━━━ ⚡
📂 **File:** \`${fileName}\`\n\n`;

            // টেলিগ্রামের মেসেজ লিমিট ৪০০০ ক্যারেক্টার হ্যান্ডল করা
            if (fileContent.length > 3500) {
                const tempFilePath = path.join(__dirname, `temp_${fileName}`);
                fs.writeFileSync(tempFilePath, fileContent, 'utf8');

                await bot.sendDocument(chatId, tempFilePath, {
                    caption: `📄 **${fileName}** ফাইলের সাইজ বড় হওয়ায় ডকুমেন্ট হিসেবে পাঠানো হলো।`,
                    reply_to_message_id: messageId,
                    parse_mode: 'Markdown'
                });

                if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
                return;
            }

            const fullText = captionHeader + "```javascript\n" + fileContent + "\n```";

            return await bot.sendMessage(chatId, fullText, {
                reply_to_message_id: messageId,
                parse_mode: 'Markdown'
            });

        } catch (error) {
            console.error("File Command Error:", error.message);
            return bot.sendMessage(chatId, "❌ ফাইল লোড করতে সমস্যা হয়েছে!", {
                reply_to_message_id: messageId
            });
        }
    }
};
