const axios = require("axios");

if (!global.globalHandleReply) {
    global.globalHandleReply = [];
}

// =========================
// LOAD BASE API URL (cached)
// =========================
// FIX: age prottek message e GitHub theke JSON fetch hoto.
// Ekhon 10 min cache thakbe, ar fetch fail holeo ager cache use hobe.
let cachedApiUrl = null;
let cachedAt = 0;

async function getApiUrl() {
    if (cachedApiUrl && Date.now() - cachedAt < 10 * 60 * 1000) {
        return cachedApiUrl;
    }
    try {
        const base = await axios.get(
            "https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json",
            { headers: { "Cache-Control": "no-cache" } }
        );

        cachedApiUrl = `${base.data.api}/baby`;
        cachedAt = Date.now();
        return cachedApiUrl;
    } catch (err) {
        console.error("❌ Base API Load Error:", err.message);
        return cachedApiUrl; // cache thakle seta, na thakle null
    }
}

const randomResponses = [
    "কোন একটি সমস্যা হইচে, একটু পর আবার চেষ্টা করুন 🥲"
];

function getRandomResponse() {
    return randomResponses[
        Math.floor(Math.random() * randomResponses.length)
    ];
}

module.exports = {
    config: {
        name: "btt",
        author: "JOY AHMED",
        // ⚠️ SOTORKO: "bot" alias ta ager bot.js command er sathe mile!
        // 2 ta command thakle framework ekta kei chalabe.
        // Tai hoy bot.js soray dao, nahoy alias theke "bot" bad dao.
        aliases: ["bot", "বট", "bby", "বাবু"],
        usePrefix: false,
        role: 0,
        cooldown: 2,
        description: "AI Baby Chat Reply System"
    },

    // =========================
    // SEND ANSWER
    // =========================
    sendAnswer: async function ({
        bot,
        chatId,
        userId,
        messageId,
        question
    }) {
        const apiUrl = await getApiUrl();

        if (!apiUrl) {
            return bot.sendMessage(chatId, getRandomResponse(), {
                reply_to_message_id: messageId
            });
        }

        try {
            const res = await axios.get(
                `${apiUrl}?text=${encodeURIComponent(question)}&senderID=${userId}&font=1`
            );

            const reply = res.data?.reply || getRandomResponse();

            const sent = await bot.sendMessage(chatId, reply, {
                reply_to_message_id: messageId
            });

            global.globalHandleReply.push({
                messageID: sent.message_id,
                author: userId,
                // FIX: this er bodole module.exports use kora holo,
                // jate framework jekhan thekei call koruk, bind thik thake.
                handleReply: module.exports.handleReply.bind(module.exports)
            });

            return sent;

        } catch (err) {
            console.error("❌ API Error:", err.message);

            return bot.sendMessage(chatId, getRandomResponse(), {
                reply_to_message_id: messageId
            });
        }
    },

    // =========================
    // ON START
    // =========================
    onStart: async function ({
        bot,
        chatId,
        userId,
        msg,
        args
    }) {
        const messageId = msg?.message_id;
        const input = args ? args.join(" ").trim() : "";

        // FIX: age sudhu "bot" likhle kichui asto na (silent return).
        // Ekhon greeting jabe, bot.js er moto.
        if (!input) {
            return bot.sendMessage(
                chatId,
                "হুম বলো! কি জানতে চাও? 😊\n💬 শুধু bot বা বট লিখে যেকোনো প্রশ্ন করো!",
                { reply_to_message_id: messageId }
            );
        }

        const [cmd, ...rest] = input.split(" ");
        const content = rest.join(" ").trim();

        // ---------- TEACH ----------
        if (cmd.toLowerCase() === "teach") {
            const [ask, ans] = content.split(" - ");

            if (!ask || !ans) {
                return bot.sendMessage(
                    chatId,
                    "❌ Format: bot teach প্রশ্ন - উত্তর",
                    { reply_to_message_id: messageId }
                );
            }

            const apiUrl = await getApiUrl();

            if (!apiUrl) {
                // FIX: age ekhane sendMessage er argument ulta chilo
                // ("❌ API URL Load Error!" ke chatId hisebe pathano hoto)
                // tai teach fail hole error throw korto, user kichui peto na.
                return bot.sendMessage(
                    chatId,
                    "❌ API URL Load Error!",
                    { reply_to_message_id: messageId }
                );
            }

            try {
                const re = await axios.get(
                    `${apiUrl}?teach=${encodeURIComponent(ask)}&reply=${encodeURIComponent(ans)}&senderID=${userId}`
                );

                return bot.sendMessage(
                    chatId,
                    `✅ Teach Added!\n💬 ASK: ${ask}\n💬 ANS: ${ans}\n${re.data.message || ""}`,
                    { reply_to_message_id: messageId }
                );

            } catch (err) {
                return bot.sendMessage(
                    chatId,
                    "⚠️ Teach পাঠানো যায়নি, পরে চেষ্টা করুন",
                    { reply_to_message_id: messageId }
                );
            }
        }

        // ---------- KEYINFO ----------
        if (cmd.toLowerCase() === "keyinfo") {
            if (!content) {
                return bot.sendMessage(
                    chatId,
                    "❌ Format: bot keyinfo প্রশ্ন",
                    { reply_to_message_id: messageId }
                );
            }

            const apiUrl = await getApiUrl();

            // FIX: age ekhane sudhu return chilo, user kichui peto na.
            if (!apiUrl) {
                return bot.sendMessage(
                    chatId,
                    "❌ API URL Load Error!",
                    { reply_to_message_id: messageId }
                );
            }

            try {
                const res = await axios.get(
                    `${apiUrl}?list=${encodeURIComponent(content)}`
                );

                const data = res.data?.data;

                if (!data) {
                    return bot.sendMessage(
                        chatId,
                        `❌ No data found for "${content}"`,
                        { reply_to_message_id: messageId }
                    );
                }

                return bot.sendMessage(
                    chatId,
                    `📚 Message for "${content}":\n${data}`,
                    { reply_to_message_id: messageId }
                );

            } catch (err) {
                return bot.sendMessage(
                    chatId,
                    "⚠️ Keyinfo আনতে সমস্যা হয়েছে",
                    { reply_to_message_id: messageId }
                );
            }
        }

        // ---------- HELP ----------
        if (cmd.toLowerCase() === "help") {
            const help = `BOT COMMAND HELP

• bot teach প্রশ্ন - উত্তর
• bot keyinfo প্রশ্ন
• bot help

💬 শুধু bot বা বট লিখে যেকোনো প্রশ্ন করো!`;

            return bot.sendMessage(chatId, help, {
                reply_to_message_id: messageId
            });
        }

        // ---------- NORMAL CHAT ----------
        return module.exports.sendAnswer({
            bot,
            chatId,
            userId,
            messageId,
            question: input
        });
    },

    // =========================
    // HANDLE REPLY
    // =========================
    // NOTE: event.threadId / messageID / body / senderID thik ache —
    // framework nijei Telegram message ke ei shape e convert kore
    // (ager bot.js command eo eki field use hoy). Eta bodlano hoy nai.
    handleReply: async function ({
        bot,
        event
    }) {
        const chatId = event.threadId;
        const messageId = event.messageID;
        const text = event.body;
        const userId = event.senderID;

        if (!text) return;

        return module.exports.sendAnswer({
            bot,
            chatId,
            userId,
            messageId,
            question: text
        });
    }
};
