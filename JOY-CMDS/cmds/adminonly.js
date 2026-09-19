const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "adminonly",
        version: "1.0.0",
        role: 2, // 2 = Bot Owner Only
        author: "Joy Ahmed",
        cooldown: 3,
        usePrefix: true
    },

    onStart: async function ({ bot, chatId, args, msg, config }) {
        const prefix = config.prefix || '/';
        const mode = args[0] ? args[0].toLowerCase() : '';
        const configPath = path.join(__dirname, '../../config.json');

        if (mode === 'on') {
            config.admin_only_mode = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

            const text = 
`🔒 <b><u>𝙰𝙳𝙼𝙸𝙽 𝙾𝙽𝙻𝚈 𝙼𝙾𝙳𝙴: 𝙾𝙽</u></b>

👑 <i>বট এখন এডমিন-ওনলি মোডে অন করা হয়েছে। এখন থেকে শুধুমাত্র Bot Owner (Joy Ahmed) কমান্ড ব্যবহার করতে পারবে!</i>`;

            return bot.sendMessage(chatId, text, {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });

        } else if (mode === 'off') {
            config.admin_only_mode = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

            const text = 
`🔓 <b><u>𝙰𝙳𝙼𝙸𝙽 𝙾𝙽𝙻𝚈 𝙼𝙾𝙳𝙴: 𝙾𝙵𝙵</u></b>

🌐 <i>এডমিন-ওনলি মোড বন্ধ করা হয়েছে। এখন সব মেম্বার কমান্ড ব্যবহার করতে পারবে!</i>`;

            return bot.sendMessage(chatId, text, {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });

        } else {
            const currentStatus = config.admin_only_mode ? "ON (🔒 Admin Only)" : "OFF (🌐 Public)";
            
            const usageText = 
`⚠️ <b><u>𝙸𝙽𝚅𝙰𝙻𝙸𝙳 𝚄𝚂𝙰𝙶𝙴</u></b>

📊 <b>𝙲𝚞𝚛𝚛𝚎𝚗𝚝 𝚂𝚝𝚊𝚝𝚞𝚜:</b> <code>${currentStatus}</code>

👉 <b>𝚃𝚞𝚛𝚗 𝙾𝚗:</b> <code>${prefix}adminonly on</code>
👉 <b>𝚃𝚞𝚛𝚗 𝙾𝚏𝚏:</b> <code>${prefix}adminonly off</code>`;

            return bot.sendMessage(chatId, usageText, {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });
        }
    }
};
