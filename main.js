const TelegramBot = require('node-telegram-bot-api');
const config = require('./config.json');
const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');
const axios = require('axios');
const gradient = require('gradient-string');

// ================= JOY CORE (main files) =================
require('./JOY/utils.js');
const TelegramAdapter = require('./JOY/telegram-adapter.js');
const checkVersion = require('./JOY/update.js');
require('./JOY/concole.js');

// ================= FILE PATH =================
const chatGroupsFile = path.join(__dirname, 'chatGroups.json');
const messageCountFile = path.join(__dirname, 'messageCount.json');
const userDataFile = path.join(__dirname, 'userData.json');

// ================= FILE INIT =================
if (!fs.existsSync(messageCountFile)) fs.writeFileSync(messageCountFile, JSON.stringify({}), 'utf8');
if (!fs.existsSync(chatGroupsFile)) fs.writeFileSync(chatGroupsFile, JSON.stringify([]), 'utf8');
if (!fs.existsSync(userDataFile)) fs.writeFileSync(userDataFile, JSON.stringify({}), 'utf8');

let chatGroups = JSON.parse(fs.readFileSync(chatGroupsFile, 'utf8'));
let gbanList = [];
let globalHandleButton = []; // inline button tracking

// ================= BOT TOKEN CHECK =================
const botToken = process.env.TELEGRAM_BOT_TOKEN || config.token;
if (!botToken || botToken.includes('PUT_YOUR_TELEGRAM_BOT_TOKEN_HERE')) {
    console.log(' Please set your bot token in config.json or the TELEGRAM_BOT_TOKEN env variable.');
    process.exit(1);
}

// ================= BOT INIT =================
const bot = new TelegramBot(botToken, { polling: true });

const commands = [];
const events = [];
let adminOnlyMode = config.admin_only_mode || false;
const cooldowns = new Map();

// ================= LOGGER =================
function logger(message) {
    try {
        console.log(gradient.pastel(message));
    } catch {
        console.log(message);
    }
}

// ================= SHOW REMOTE BOT ART (optional, safe to fail) =================
async function showRemoteBotArt() {
    try {
        const res = await axios.get('https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/notification.txt', { timeout: 5000 });
        logger(res.data);
    } catch (err) {
        logger(` ${config.bot_name || 'JOY BOT'} started.`);
    }
}

// ================= GBAN FETCH (optional, safe to fail) =================
async function fetchGbanList() {
    try {
        const res = await axios.get('https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/gban.json', { timeout: 5000 });
        gbanList = res.data.map(u => u.ID.toString());
        logger(` Gban loaded: ${gbanList.length} users`);
    } catch (err) {
        // Silently skip if not reachable - not required for the bot to function
    }
}
fetchGbanList();
cron.schedule('*/5 * * * *', fetchGbanList);

// ================= COMMAND LOAD (from JOY-CMDS/cmds) =================
const cmdsDir = path.join(__dirname, 'JOY-CMDS', 'cmds');
fs.readdirSync(cmdsDir).forEach(file => {
    if (!file.endsWith('.js')) return;
    try {
        const command = require(path.join(cmdsDir, file));
        if (!command.config.role) command.config.role = 0;
        if (!command.config.cooldown) command.config.cooldown = 0;

        commands.push({
            ...command,
            config: { ...command.config, name: command.config.name.toLowerCase() }
        });

        const usePrefix = command.config.usePrefix !== false;
        const pattern = usePrefix
            ? `^\\${config.prefix}${command.config.name}\\b(.*)$`
            : `^${command.config.name}\\b(.*)$`;

        bot.onText(new RegExp(pattern, 'i'), (msg, match) => {
            executeCommand(bot, command, msg, match);
        });

        logger(` Loaded command: ${command.config.name}`);
    } catch (err) {
        console.error(gradient.passion ? gradient.passion(` Error loading ${file}: ${err.message}`) : ` Error loading ${file}: ${err.message}`);
    }
});

// ================= EVENT LOAD (from JOY-CMDS/events) =================
const eventsDir = path.join(__dirname, 'JOY-CMDS', 'events');
fs.readdirSync(eventsDir).forEach(file => {
    if (!file.endsWith('.js')) return;
    try {
        const eventModule = require(path.join(eventsDir, file));
        if (typeof eventModule.handleEvent === 'function') {
            events.push(eventModule);
            logger(` Loaded event: ${file}`);
        }
    } catch (err) {
        console.error(gradient.passion ? gradient.passion(` Error loading event ${file}: ${err.message}`) : ` Error loading event ${file}: ${err.message}`);
    }
});

bot.on('message', async (msg) => {
    for (const eventModule of events) {
        try {
            await eventModule.handleEvent({
                event: { msg, body: msg.text },
                api: new TelegramAdapter(bot),
                bot
            });
        } catch (err) {
            console.error(' Event Error:', err);
        }
    }
});

// ================= CALLBACK QUERY HANDLER =================
bot.on('callback_query', async (query) => {
    const handle = globalHandleButton.find(h => h.messageID === query.message.message_id);
    if (!handle) return;

    const event = {
        threadId: query.message.chat.id,
        button: query.data
    };

    try {
        if (typeof handle.handleButton === 'function') {
            await handle.handleButton({ bot, event, handleButton: handle });
        }
    } catch (err) {
        console.error(' Error in button handler:', err);
        bot.sendMessage(event.threadId, ' Failed to handle button.');
    }
});

// ================= ADMIN CHECK =================
async function isUserAdmin(bot, chatId, userId) {
    try {
        const admins = await bot.getChatAdministrators(chatId);
        return admins.some(a => a.user.id === userId);
    } catch {
        return false;
    }
}

// ================= EXEC COMMAND =================
async function executeCommand(bot, command, msg, match) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
        if (gbanList.includes(userId.toString())) return bot.sendMessage(chatId, ' You are globally banned.');

        const isAdmin = await isUserAdmin(bot, chatId, userId);
        const isBotAdmin = userId.toString() === (config.owner_id || '').toString();

        if (adminOnlyMode && !isBotAdmin) return bot.sendMessage(chatId, ' Bot is in admin-only mode.');
        if (command.config.role === 2 && !isBotAdmin) return bot.sendMessage(chatId, ' Bot admin only command.');
        if (command.config.role === 1 && !isAdmin && !isBotAdmin) return bot.sendMessage(chatId, ' Group admin only command.');

        const cdKey = `${command.config.name}-${userId}`;
        const now = Date.now();
        const cd = (command.config.cooldown || 0) * 1000;

        if (cooldowns.has(cdKey)) {
            const last = cooldowns.get(cdKey);
            if (now < last + cd) {
                const wait = Math.ceil((last + cd - now) / 1000);
                return bot.sendMessage(chatId, ` Wait ${wait}s`);
            }
        }
        cooldowns.set(cdKey, now);

        const api = new TelegramAdapter(bot);
        const args = (match[1] || '').trim().split(/\s+/).filter(Boolean);

        await command.onStart({
            bot,
            chatId,
            args,
            userId,
            msg,
            api,
            config,
            commands,
            message: { reply: t => bot.sendMessage(chatId, t, { reply_to_message_id: msg.message_id }) },
            event: {
                threadID: chatId,
                messageID: msg.message_id,
                senderID: userId,
                body: msg.text || ''
            },
            globalHandleButton
        });
    } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, ` Error: ${err.message}`);
    }
}

// ================= MESSAGE COUNT + AUTO WELCOME =================
bot.on('message', msg => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Message count
    const data = JSON.parse(fs.readFileSync(messageCountFile));
    if (!data[chatId]) data[chatId] = {};
    if (!data[chatId][userId]) data[chatId][userId] = 0;
    data[chatId][userId]++;
    fs.writeFileSync(messageCountFile, JSON.stringify(data, null, 2));

    if (!chatGroups.includes(chatId)) {
        chatGroups.push(chatId);
        fs.writeFileSync(chatGroupsFile, JSON.stringify(chatGroups, null, 2));
    }

    // Auto welcome message on user's first ever message to the bot
    if (!msg.from.is_bot) {
        const notifiedUsers = JSON.parse(fs.readFileSync(userDataFile));
        if (!notifiedUsers[userId]) {
            try {
                const startCommand = require(path.join(cmdsDir, 'start.js'));
                startCommand.onStart({ bot, chatId, msg, config });
            } catch (err) {
                console.error(' Start command error:', err);
            }

            notifiedUsers[userId] = true;
            fs.writeFileSync(userDataFile, JSON.stringify(notifiedUsers, null, 2));
        }
    }
});

// ================= START =================
(async () => {
    await checkVersion(); // version check first
    await showRemoteBotArt();
    logger(' Bot started successfully');
    logger(` Commands loaded: ${commands.length}`);
    logger(` Owner: ${config.owner_name}`);
    logger(` Prefix: ${config.prefix}`);
})();

process.on('unhandledRejection', (err) => {
    console.error(' Unhandled Rejection:', err);
});
