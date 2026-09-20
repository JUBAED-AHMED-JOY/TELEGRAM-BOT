const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "setting",
        version: "1.0.0",
        role: 1, // 1 = Group Admin & Bot Owner Only
        author: "Joy Ahmed",
        cooldown: 3,
        description: "Group & Bot Settings Panel Control",
        usePrefix: true
    },

    onStart: async function ({ bot, chatId, args, msg, config }) {
        const configFile = path.join(__dirname, '../../config.json');
        const prefix = config.prefix || '/';
        const subCommand = args[0] ? args[0].toLowerCase() : '';
        const value = args[1] ? args[1].trim() : '';

        // ================= 1. PREFIX CHANGE =================
        if (subCommand === 'prefix') {
            if (!value) {
                return bot.sendMessage(chatId, `⚠️ <i>নতুন Prefix প্রদান করুন!</i>\n📌 <b>Usage:</b> <code>${prefix}setting prefix !</code>`, {
                    parse_mode: 'HTML',
                    reply_to_message_id: msg.message_id
                });
            }

            config.prefix = value;
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf8');

            return bot.sendMessage(chatId, `✅ <b><u>𝙿𝚁𝙴𝙵𝙸𝚇  𝚄𝙿𝙳𝙰𝚃𝙴𝙳</u></b>\n\n📌 <b>New Prefix:</b> <code>${value}</code>`, {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });
        }

        // ================= 2. WELCOME TOGGLE =================
        if (subCommand === 'welcome') {
            if (value === 'on') {
                config.welcome_status = true;
                fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf8');
                return bot.sendMessage(chatId, "✅ <b>Welcome Message:</b> <code>ON</code>", { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
            }
            if (value === 'off') {
                config.welcome_status = false;
                fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf8');
                return bot.sendMessage(chatId, "❌ <b>Welcome Message:</b> <code>OFF</code>", { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
            }
            return bot.sendMessage(chatId, `📌 <b>Usage:</b> <code>${prefix}setting welcome on/off</code>`, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
        }

        // ================= 3. ANTI-LINK TOGGLE =================
        if (subCommand === 'antilink') {
            if (value === 'on') {
                config.anti_link = true;
                fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf8');
                return bot.sendMessage(chatId, "🛡️ <b>Anti-Link Protection:</b> <code>ON</code>", { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
            }
            if (value === 'off') {
                config.anti_link = false;
                fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf8');
                return bot.sendMessage(chatId, "🔓 <b>Anti-Link Protection:</b> <code>OFF</code>", { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
            }
            return bot.sendMessage(chatId, `📌 <b>Usage:</b> <code>${prefix}setting antilink on/off</code>`, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
        }

        // ================= SETTINGS DASHBOARD =================
        const currentPrefix = config.prefix || '/';
        const approvalMode = config.approval_system ? "ON (🔒 Approved Only)" : "OFF (🌐 Auto Work)";
        const welcomeStatus = config.welcome_status ? "ON ✅" : "OFF ❌";
        const antiLinkStatus = config.anti_link ? "ON 🛡️" : "OFF 🔓";

        const panelText = 
`⚙️ ═════════════════ ⚙️
  📊  <b><u>𝙱𝙾𝚃  𝚂𝙴𝚃𝚃𝙸𝙽𝙶𝚂  𝙿𝙰𝙽𝙴𝙻</u></b>
⚙️ ═════════════════ ⚙️

📌 <b>Current Prefix:</b> <code>${currentPrefix}</code>
🔒 <b>Approval System:</b> <code>${approvalMode}</code>
👋 <b>Welcome Status:</b> <code>${welcomeStatus}</code>
🛡️ <b>Anti-Link Protection:</b> <code>${antiLinkStatus}</code>

👉 <b><u>𝚂𝚎𝚝𝚝𝚒𝚗𝚐𝚜  𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜:</u></b>
• <code>${currentPrefix}setting prefix <symbol></code> (Prefix পরিবর্তন)
• <code>${currentPrefix}setting welcome on/off</code> (Welcome মেসেজ অন/অফ)
• <code>${currentPrefix}setting antilink on/off</code> (লিঙ্ক প্রটেকশন অন/অফ)
• <code>${currentPrefix}approve on/off</code> (Approval সিস্টেম অন/অফ)

👑 <b>𝙾𝚯𝚗𝚎𝚛:</b> <b><u>𝙹𝚘𝚢 𝙰𝚑𝚖𝚎𝚍</u></b>`;

        return bot.sendMessage(chatId, panelText, {
            parse_mode: 'HTML',
            reply_to_message_id: msg.message_id
        });
    }
};
