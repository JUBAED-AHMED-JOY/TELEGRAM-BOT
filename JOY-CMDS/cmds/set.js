const axios = require('axios');

module.exports = {
    config: {
        name: "set",
        version: "1.0.1",
        role: 2, // 2 = Bot Owner Only (Joy Ahmed)
        author: "Joy Ahmed",
        cooldown: 3,
        description: "Bot Full Control Settings (Name, Bio, Description, Profile Pic, Commands)",
        usePrefix: true
    },

    onStart: async function ({ bot, chatId, args, msg, config }) {
        const prefix = config.prefix || '/';
        const subCommand = args[0] ? args[0].toLowerCase() : '';
        const value = args.slice(1).join(' ');

        // ================= 1. CHANGE BOT PROFILE PHOTO (UPLOAD PIC) =================
        if (subCommand === 'pic' || subCommand === 'photo' || subCommand === 'avatar') {
            let photoUrl = value;

            // যদি ছবিতে রিপ্লাই দিয়ে /set pic দেওয়া হয়
            if (msg.reply_to_message && msg.reply_to_message.photo) {
                const photoArray = msg.reply_to_message.photo;
                const fileId = photoArray[photoArray.length - 1].file_id;
                const fileLink = await bot.getFileLink(fileId);
                photoUrl = fileLink;
            }

            if (!photoUrl) {
                return bot.sendMessage(chatId, `⚠️ <i>দয়া করে কোনো ছবিতে রিপ্লাই দিন অথবা ছবির ইমেজ URL দিন!</i>\n📌 <b>Usage:</b> <code>${prefix}set pic</code> (reply to photo)`, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
            }

            const loadingMsg = await bot.sendMessage(chatId, "⏳ <i>বটের প্রোফাইল পিকচার আপডেট করা হচ্ছে...</i>", { parse_mode: 'HTML', reply_to_message_id: msg.message_id });

            try {
                // Image Stream Fetch
                const response = await axios.get(photoUrl, { responseType: 'stream' });
                
                // Set Bot Profile Photo using Telegram API
                await bot.setMyProfilePhoto(response.data);

                return bot.editMessageText("✅ <b><u>BOT PROFILE PHOTO UPDATED</u></b>\n\n🎉 <i>বটের প্রোফাইল পিকচার সফলতার সাথে পরিবর্তন করা হয়েছে!</i>", {
                    chat_id: chatId,
                    message_id: loadingMsg.message_id,
                    parse_mode: 'HTML'
                });
            } catch (err) {
                console.error('Set Profile Photo Error:', err.message);
                return bot.editMessageText(`❌ <i>পিকচার সেট করতে ব্যর্থ হয়েছে!</i>\n<b>Error:</b> <code>${err.message}</code>`, {
                    chat_id: chatId,
                    message_id: loadingMsg.message_id,
                    parse_mode: 'HTML'
                });
            }
        }

        // ================= 2. CHANGE BOT NAME =================
        if (subCommand === 'name') {
            if (!value) {
                return bot.sendMessage(chatId, `⚠️ <i>নতুন বটের নাম লিখুন!</i>\n📌 <b>Usage:</b> <code>${prefix}set name My Powerful Bot</code>`, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
            }

            try {
                await bot.setMyName({ name: value });
                return bot.sendMessage(chatId, `✅ <b><u>BOT NAME UPDATED</u></b>\n\n🏷️ <b>New Name:</b> <code>${value}</code>`, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
            } catch (err) {
                return bot.sendMessage(chatId, `❌ <i>নাম পরিবর্তন ব্যর্থ:</i> <code>${err.message}</code>`, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
            }
        }

        // ================= 3. CHANGE BOT BIO (SHORT DESCRIPTION) =================
        if (subCommand === 'bio' || subCommand === 'shortdesc') {
            if (!value) {
                return bot.sendMessage(chatId, `⚠️ <i>নতুন বায়ো লিখুন!</i>\n📌 <b>Usage:</b> <code>${prefix}set bio Official Bot Created By Joy Ahmed</code>`, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
            }

            try {
                await bot.setMyShortDescription({ short_description: value });
                return bot.sendMessage(chatId, `✅ <b><u>BOT BIO UPDATED</u></b>\n\n📝 <b>New Bio:</b> <i>${value}</i>`, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
            } catch (err) {
                return bot.sendMessage(chatId, `❌ <i>বায়ো পরিবর্তন ব্যর্থ:</i> <code>${err.message}</code>`, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
            }
        }

        // ================= 4. CHANGE BOT ABOUT / DESCRIPTION =================
        if (subCommand === 'desc' || subCommand === 'about') {
            if (!value) {
                return bot.sendMessage(chatId, `⚠️ <i>বটের ডেসক্রিপশন লিখুন!</i>\n📌 <b>Usage:</b> <code>${prefix}set desc Welcome to my Bot!</code>`, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
            }

            try {
                await bot.setMyDescription({ description: value });
                return bot.sendMessage(chatId, `✅ <b><u>BOT DESCRIPTION UPDATED</u></b>\n\n📄 <b>New Description:</b>\n<i>${value}</i>`, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
            } catch (err) {
                return bot.sendMessage(chatId, `❌ <i>ডেসক্রিপশন পরিবর্তন ব্যর্থ:</i> <code>${err.message}</code>`, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
            }
        }

        // ================= 5. SET BOT COMMANDS LIST =================
        if (subCommand === 'cmds' || subCommand === 'commands') {
            try {
                const commandsList = [
                    { command: 'start', description: 'Start the bot' },
                    { command: 'help', description: 'Show command list' },
                    { command: 'bd', description: 'Get BD video' },
                    { command: 'approve', description: 'Approve groups (Owner Only)' },
                    { command: 'set', description: 'Bot Settings (Owner Only)' }
                ];

                await bot.setMyCommands(commandsList);
                return bot.sendMessage(chatId, `✅ <b><u>BOT COMMANDS LIST UPDATED</u></b>\n\n📜 <i>টেলিগ্রাম মেনু বাটনে কমান্ডসমূহ সেট করা হয়েছে!</i>`, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
            } catch (err) {
                return bot.sendMessage(chatId, `❌ <i>কমান্ড মেনু আপলোড ব্যর্থ:</i> <code>${err.message}</code>`, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
            }
        }

        // ================= SETTINGS MENU GUIDE =================
        const usageText = 
`⚙️ <b><u>BOT SETTINGS CONTROL</u></b>

👑 <b>Admin:</b> <b><u>Joy Ahmed</u></b>

👉 <b>পিকচার আপডেট করতে:</b>
• <code>${prefix}set pic</code> (যেকোনো ছবিতে রিপ্লাই করে লিখুন)

👉 <b>নাম পরিবর্তন করতে:</b>
• <code>${prefix}set name Bot Name</code>

👉 <b>বায়ো / Short Bio সেট করতে:</b>
• <code>${prefix}set bio Short Bio Text</code>

👉 <b>বট ডেসক্রিপশন সেট করতে:</b>
• <code>${prefix}set desc Full Description Text</code>

👉 <b>টেলিগ্রাম মেনু কমান্ড সেট করতে:</b>
• <code>${prefix}set cmds</code>`;

        return bot.sendMessage(chatId, usageText, {
            parse_mode: 'HTML',
            reply_to_message_id: msg.message_id
        });
    }
};
