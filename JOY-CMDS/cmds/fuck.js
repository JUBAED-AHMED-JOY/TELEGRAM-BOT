const fs = require("fs");
const axios = require("axios");
const path = require("path");
const jimp = require("jimp");

const TEMPLATE_URL = "https://drive.google.com/uc?id=1DEVtK3nSegoSjT4VsXMhnkEO3Sct9sgz";

function cacheDir() {
    const dir = path.join(__dirname, "cache", "canvas");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
}

async function ensureTemplate() {
    const dir = cacheDir();
    const bgPath = path.join(dir, "fuckv2.png");
    if (!fs.existsSync(bgPath)) {
        const res = await axios.get(TEMPLATE_URL, { responseType: "arraybuffer" });
        fs.writeFileSync(bgPath, Buffer.from(res.data));
    }
    return bgPath;
}

// Telegram profile photo namano; photo na thakle null
async function downloadAvatar(bot, userId, outPath) {
    try {
        const photos = await bot.getUserProfilePhotos(userId, { limit: 1 });
        if (!photos || !photos.total_count || !photos.photos.length) return null;
        const sizes = photos.photos[0];
        const fileId = sizes[sizes.length - 1].file_id;
        const link = await bot.getFileLink(fileId);
        const res = await axios.get(link, { responseType: "arraybuffer" });
        fs.writeFileSync(outPath, Buffer.from(res.data));
        return outPath;
    } catch (e) {
        return null;
    }
}

// Photo na thakle simple rongin placeholder avatar
async function placeholderAvatar(outPath) {
    const colors = [0x2b6cb0ff, 0x9b2c2cff, 0x276749ff, 0x6b46c1ff, 0xb7791fff];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const img = new jimp(512, 512, color);
    await img.writeAsync(outPath);
    return outPath;
}

async function circle(imagePath) {
    const image = await jimp.read(imagePath);
    image.circle();
    return await image.getBufferAsync("image/png");
}

async function makeImage(bot, one, two) {
    const dir = cacheDir();
    const bgPath = await ensureTemplate();
    const pathImg = path.join(dir, `fuck_${one}_${two}_${Date.now()}.png`);
    const avatarOnePath = path.join(dir, `avt_${one}.png`);
    const avatarTwoPath = path.join(dir, `avt_${two}.png`);

    let avtOne = await downloadAvatar(bot, one, avatarOnePath);
    if (!avtOne) avtOne = await placeholderAvatar(avatarOnePath);
    let avtTwo = await downloadAvatar(bot, two, avatarTwoPath);
    if (!avtTwo) avtTwo = await placeholderAvatar(avatarTwoPath);

    const bg = await jimp.read(bgPath);
    const circOne = await jimp.read(await circle(avtOne));
    const circTwo = await jimp.read(await circle(avtTwo));

    bg.composite(circOne.resize(180, 180), 190, 200);
    bg.composite(circTwo.resize(180, 180), 390, 200);

    const finalImg = await bg.getBufferAsync("image/png");
    fs.writeFileSync(pathImg, finalImg);
    fs.unlinkSync(avatarOnePath);
    fs.unlinkSync(avatarTwoPath);
    return pathImg;
}

// Target user ber kora: reply > text_mention > numeric ID arg
function resolveTarget(msg, args) {
    if (msg.reply_to_message && msg.reply_to_message.from) {
        return msg.reply_to_message.from;
    }
    if (msg.entities) {
        const tm = msg.entities.find(e => e.type === "text_mention" && e.user);
        if (tm) return tm.user;
    }
    if (args[0] && /^\d+$/.test(args[0])) {
        return { id: Number(args[0]), first_name: "User" };
    }
    return null;
}

module.exports = {
    config: {
        name: "fuck",
        author: "JOY AHMED",
        role: 0,
        usePrefix: true,
        cooldown: 5,
        description: "Generates a 'fuck' meme with your avatar and target user's avatar."
    },

    onStart: async function ({ bot, chatId, userId, msg, args }) {
        const messageId = msg ? msg.message_id : undefined;

        const target = resolveTarget(msg, args);
        if (!target) {
            return bot.sendMessage(
                chatId,
                "⚠️ 1 jon ke target koro!\n\n👉 Karo message e reply diye /fuck likho,\n👉 othoba mention picker theke naam select kore /fuck likho,\n👉 othoba /fuck <user_id> dao.",
                { reply_to_message_id: messageId }
            );
        }

        const one = userId;
        const two = target.id;
        const targetName = target.first_name || "User";

        try {
            const imgPath = await makeImage(bot, one, two);
            await bot.sendPhoto(chatId, imgPath, {
                caption: `🥵 Fuck mode activated!\n🎯 Target: ${targetName}`,
                reply_to_message_id: messageId
            });
            fs.unlinkSync(imgPath);
        } catch (err) {
            console.error("fuck command error:", err.message);
            return bot.sendMessage(
                chatId,
                "❌ Error generating image.",
                { reply_to_message_id: messageId }
            );
        }
    }
};
