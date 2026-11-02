/* ============================================================
   ADD COMMAND — Reply kora video Random API te add korbe
   File: JOY-CMDS/cmds/add.js

   Bebohar (sudhu bot owner, role 2):
     1) Jekono video message e reply koro
     2) Likho: /add <name>
        Example: /add funny
     -> Oi video Random API te <name> diye add hobe,
        pore /random <name> diye ba random e pawa jabe.

   Kibhabe kaj kore:
     - Reply kora video er Telegram file link niye
       API er /api/add e pathay (name + url — add keyless,
       key lage na)
     - API video ta download kore joy-upload-api te upload
       kore (Telegram channel e jay), tarpor viewer link ta
       GitHub er data/videos.json e name diye save kore.

   ⚠️ MONE RAKHBA:
     - Telegram file link er vitore bot token thake.
       Token ta videos.json e save hoy NA (sudhu viewer
       link save hoy), kintu add request er moddhe token
       thakbe — tai API log kothao share korba na, ar
       bot token kokhono public korba na. Token leak hole
       BotFather theke regenerate koro (video gula
       channel e thakay data harabe na).
     - Boro video Vercel er time limit e fail korte pare.
     - Role 2 mane sudhu bot owner add korte parbe —
       nahole je keu list e video dhukiye dito. Sobai
       ke add dite chaile role: 0 kore dao.

   Env (na thakle default cholbe):
     RANDOM_API_BASE (default: https://joy-random-api-40-seven.vercel.app)
   ============================================================ */

const axios = require("axios");

const API_BASE = process.env.RANDOM_API_BASE || "https://joy-random-api-40-seven.vercel.app";

module.exports = {
    config: {
        name: "add",
        role: 2,
        cooldown: 5,
        description: "Reply kora video Random API te name diye add korbe",
        usePrefix: true,
        author: "JOY"
    },

    async onStart({ bot, chatId, msg, args }) {
        const messageId = msg ? msg.message_id : undefined;
        const reply = (text, extra = {}) =>
            bot.sendMessage(chatId, text, { reply_to_message_id: messageId, ...extra });

        const name = args[0];
        if (!name) {
            return reply(
                "📦 Usage: kono video te reply diye likho\n" +
                "/add <name>\n" +
                "Example: /add funny"
            );
        }

        const rep = msg && msg.reply_to_message;
        if (!rep) {
            return reply("❌ Age kono video te reply koro, tarpor /add <name> likho.");
        }

        // video / video_note / animation / document (file hisebe pathano video)
        const media = rep.video || rep.video_note || rep.animation || rep.document;
        if (!media || !media.file_id) {
            return reply("❌ Reply kora message e kono video pai nai — video te reply diye /add <name> likho.");
        }

        let waitMsg = null;
        try {
            waitMsg = await reply("⏳ Video API te add hocche...");

            // Telegram file link (er vitore bot token thake — caveat upore dekho)
            const link = await bot.getFileLink(media.file_id);

            const res = await axios.post(
                API_BASE + "/api/add",
                { name, url: link },
                { timeout: 120000, validateStatus: () => true }
            );
            const data = res.data || {};

            if (waitMsg) await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});

            if (!data.status) {
                return reply("❌ Add hoy nai: " + (data.error || ("HTTP " + res.status)));
            }

            return reply(
                "✅ Video add hoise!\n" +
                `📌 Name: ${data.name}\n` +
                `🔗 Link: ${data.url}\n` +
                (data.count ? `📊 Ei name e video: ${data.count} ta\n` : '') +
                `📈 Total video: ${data.totalVideos || data.total} ta`
            );
        } catch (e) {
            if (waitMsg) await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
            console.error("Add error:", e.message);
            const apiErr = e.response && e.response.data && e.response.data.error;
            return reply("❌ Add hoy nai: " + (apiErr || e.message.slice(0, 300)));
        }
    }
};
