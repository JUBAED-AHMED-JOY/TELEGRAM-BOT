const axios = require('axios');

const PER_PAGE = 12;
const PHOTO_URL = 'https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/bot.png';
const OWNER_URL = 'https://t.me/JOY_AHMED_88';

let callbackReady = false;
let cachedCommands = [];
let cachedPrefix = '/';
const msgMeta = new Map(); // message_id -> { hasPhoto: bool }

function roleIcon(role) {
    if (role === 2) return '👑';
    if (role === 1) return '🛡️';
    return '👥';
}

function roleLabel(role) {
    if (role === 2) return 'Owner';
    if (role === 1) return 'Admin';
    return 'Everyone';
}

function roleFont(role) {
    if (role === 2) return '𝑂𝑤𝑛𝑒𝑟';
    if (role === 1) return '𝐴𝑑𝑚𝑖𝑛';
    return '𝐸𝑣𝑒𝑟𝑦𝑜𝑛𝑒';
}

// Role onujayi group, tarpor naam onujayi sort
function sortedCommands(commands) {
    return [...(commands || [])]
        .filter((c) => c && c.config && c.config.name)
        .sort((a, b) => {
            const ra = a.config.role || 0;
            const rb = b.config.role || 0;
            if (ra !== rb) return ra - rb;
            return a.config.name.localeCompare(b.config.name);
        });
}

// Owner button (URL button — chap dile profile khulbe)
function ownerRow() {
    return [{ text: '👑 Owner JOY AHMED', url: OWNER_URL }];
}

// Ekta page er text + keyboard banano
function renderPage(commands, prefix, page) {
    const list = sortedCommands(commands);
    const totalPages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    const p = Math.min(Math.max(page, 1), totalPages);
    const slice = list.slice((p - 1) * PER_PAGE, p * PER_PAGE);

    // Role bodle gele section header bosbe
    let lines = '';
    let lastRole = null;
    for (const c of slice) {
        const r = c.config.role || 0;
        if (r !== lastRole) {
            lines += `\n${roleIcon(r)} ─── ${roleFont(r)} ───\n`;
            lastRole = r;
        }
        lines += `▸ ${prefix}${c.config.name}\n`;
    }

    const text =
        `🤖 ━━━━ 𝐉𝐎𝐘 𝐁𝐎𝐓 ━━━━ 🤖\n` +
        `✨ 𝐻𝑒𝑙𝑝 𝐶𝑒𝑛𝑡𝑒𝑟 ✨\n` +
        `📊 ${list.length} 𝐶𝑜𝑚𝑚𝑎𝑛𝑑𝑠  •  📄 𝑃𝑎𝑔𝑒 ${p}/${totalPages}\n` +
        `${lines}\n` +
        `💡 /help <name> 𝑑𝑖𝑙𝑒 𝑑𝑒𝑡𝑎𝑖𝑙𝑠 𝑝𝑎𝑏𝑒  •  /help all 𝑠𝑜𝑏 𝑑𝑒𝑘ℎ𝑎𝑏𝑒\n` +
        `👑 DEVELOPER: JOY AHMED`;

    const prev = p - 1 < 1 ? totalPages : p - 1;
    const next = p + 1 > totalPages ? 1 : p + 1;
    const keyboard = [
        [
            { text: '⬅️ Prev', callback_data: `help:page:${prev}` },
            { text: '➡️ Next', callback_data: `help:page:${next}` }
        ],
        ownerRow(),
        [
            { text: '📁 Categories', callback_data: 'help:cats' },
            { text: '📋 All', callback_data: 'help:page:1' },
            { text: '❌ Close', callback_data: 'help:close' }
        ]
    ];

    return { text, keyboard, page: p, totalPages };
}

// Categories button: role-wise count
function renderCats(commands) {
    const list = sortedCommands(commands);
    let everyone = 0, admin = 0, owner = 0;
    for (const c of list) {
        if (c.config.role === 2) owner++;
        else if (c.config.role === 1) admin++;
        else everyone++;
    }

    const text =
        `🤖 ━━━━ 𝐉𝐎𝐘 𝐁𝐎𝐓 ━━━━ 🤖\n` +
        `📁 𝐶𝑎𝑡𝑒𝑔𝑜𝑟𝑖𝑒𝑠\n\n` +
        `👥 𝐸𝑣𝑒𝑟𝑦𝑜𝑛𝑒 — ${everyone} commands\n` +
        `🛡️ 𝐴𝑑𝑚𝑖𝑛 — ${admin} commands\n` +
        `👑 𝑂𝑤𝑛𝑒𝑟 — ${owner} commands\n\n` +
        `👑 𝐷𝑒𝑣𝑒𝑙𝑜𝑝𝑒𝑟: @JOY_AHMED_88`;

    const keyboard = [
        [{ text: '◀️ Back', callback_data: 'help:page:1' }],
        ownerRow(),
        [{ text: '❌ Close', callback_data: 'help:close' }]
    ];

    return { text, keyboard };
}

// Photo caption hole editMessageCaption, text hole editMessageText
async function editHelpMessage(bot, chatId, messageId, text, keyboard) {
    const meta = msgMeta.get(messageId);
    const opts = {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: { inline_keyboard: keyboard }
    };
    try {
        if (meta && meta.hasPhoto) await bot.editMessageCaption(text, opts);
        else await bot.editMessageText(text, opts);
    } catch (e) {
        // Ulta type hole ulta ta try koro
        try {
            if (meta && meta.hasPhoto) await bot.editMessageText(text, opts);
            else await bot.editMessageCaption(text, opts);
        } catch (_) { /* ignore */ }
    }
}

// Button click handler (ekbar register hobe)
function ensureCallback(bot) {
    if (callbackReady) return;
    callbackReady = true;

    bot.on('callback_query', async (query) => {
        const data = query.data || '';
        if (!data.startsWith('help:')) return; // onno command er button na

        const parts = data.split(':');
        const action = parts[1];
        const arg = parts[2];
        const msg = query.message;
        if (!msg) return;

        const chatId = msg.chat.id;
        const messageId = msg.message_id;

        try {
            if (action === 'close') {
                await bot.deleteMessage(chatId, messageId);
                msgMeta.delete(messageId);
            } else if (action === 'page') {
                const { text, keyboard } = renderPage(
                    cachedCommands, cachedPrefix, parseInt(arg, 10) || 1
                );
                await editHelpMessage(bot, chatId, messageId, text, keyboard);
            } else if (action === 'cats') {
                const { text, keyboard } = renderCats(cachedCommands);
                await editHelpMessage(bot, chatId, messageId, text, keyboard);
            }
            // noop: kichu korar nai, sudhu answer
            await bot.answerCallbackQuery(query.id);
        } catch (e) {
            try { await bot.answerCallbackQuery(query.id, { text: 'Error!' }); } catch (_) {}
        }
    });
}

module.exports = {
    config: {
        name: 'help',
        role: 0,
        cooldown: 3,
        description: 'List all available commands',
        usePrefix: true,
        author: 'JOY'
    },

    async onStart({ bot, chatId, msg, args, commands, config }) {
        const prefix = (config && config.prefix) || '/';
        const messageId = msg ? msg.message_id : undefined;
        ensureCallback(bot);

        const list = sortedCommands(commands);
        if (list.length === 0) {
            return bot.sendMessage(chatId, 'No commands loaded.');
        }

        cachedCommands = list;
        cachedPrefix = prefix;

        const sub = (args[0] || '').toLowerCase();

        // ---------- /help <name> / /help info <name> -> details ----------
        if (sub && sub !== 'all' && sub !== 'cat') {
            const name = sub === 'info' ? (args[1] || '').toLowerCase() : sub;
            const cmd = list.find((c) => c.config.name.toLowerCase() === name);
            if (!cmd) {
                return bot.sendMessage(
                    chatId,
                    `❌ "${name}" nam e kono command pawa jay nai.\nSob dekhte: ${prefix}help all`,
                    { reply_to_message_id: messageId }
                );
            }
            const cfg = cmd.config;
            const detail =
                `🤖 ━━━━ 𝐉𝐎𝐘 𝐁𝐎𝐓 ━━━━ 🤖\n` +
                `📖 𝐶𝑜𝑚𝑚𝑎𝑛𝑑 𝐼𝑛𝑓𝑜\n\n` +
                `▸ Name: ${prefix}${cfg.name} ${roleIcon(cfg.role)}\n` +
                `▸ Role: ${roleLabel(cfg.role)}\n` +
                `▸ Description: ${cfg.description || '—'}\n` +
                `▸ Cooldown: ${cfg.cooldown || 0}s\n\n` +
                `👑 𝐷𝑒𝑣𝑒𝑙𝑜𝑝𝑒𝑟: @JOY_AHMED_88`;
            return bot.sendMessage(chatId, detail, {
                reply_markup: { inline_keyboard: [ownerRow()] },
                reply_to_message_id: messageId
            });
        }

        // ---------- /help cat ... -> category system nai ----------
        if (sub === 'cat') {
            return bot.sendMessage(
                chatId,
                `⚠️ Category system ei bot e add kora nai.\nRole-wise group dekhte help menu er 📁 Categories button chap dao, ba ${prefix}help all likho.`,
                { reply_to_message_id: messageId }
            );
        }

        // ---------- default + /help all -> page 1 ----------
        const { text, keyboard } = renderPage(list, prefix, 1);

        // Photo + caption (12 ta command caption limit 1024 er vitore thake)
        try {
            const response = await axios.get(PHOTO_URL, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data);
            const sent = await bot.sendPhoto(chatId, imageBuffer, {
                caption: text,
                reply_markup: { inline_keyboard: keyboard },
                reply_to_message_id: messageId
            });
            if (msgMeta.size > 200) msgMeta.clear();
            msgMeta.set(sent.message_id, { hasPhoto: true });
            return sent;
        } catch (error) {
            console.error('Photo Send Error:', error.message);
            // Chobi fail hole sudhu text + button jabe
            const sent = await bot.sendMessage(chatId, text, {
                reply_markup: { inline_keyboard: keyboard },
                reply_to_message_id: messageId
            });
            if (msgMeta.size > 200) msgMeta.clear();
            msgMeta.set(sent.message_id, { hasPhoto: false });
            return sent;
        }
    }
};
