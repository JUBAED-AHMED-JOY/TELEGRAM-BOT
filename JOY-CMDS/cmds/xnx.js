const fs = require("fs");
const axios = require("axios");
const path = require("path");
const jimp = require("jimp");

const TEMPLATE_URL = "https://drive.google.com/uc?id=1DPUFsT7-FMFx1tgmV8_zqAuZmTUHdmU8";

function cacheDir() {
    const dir = path.join(__dirname, "cache", "canvas");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
}

async function ensureTemplate() {
    const dir = cacheDir();
    const bgPath = path.join(dir, "Xnx.png");
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
    const colors = [0xe53e3eff, 0xd53f8cff, 0x9b2c2cff, 0x6b46c1ff, 0x2b6cb0ff];
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
    const pathImg = path.join(dir, `xnx_${one}_${two}_${Date.now()}.png`);
    const avatarOnePath = path.join(dir, `avt_${one}.png`);
    const avatarTwoPath = path.join(dir, `avt_${two}.png`);

    let avtOne = await downloadAvatar(bot, one, avatarOnePath);
    if (!avtOne) avtOne = await placeholderAvatar(avatarOnePath);
    let avtTwo = await downloadAvatar(bot, two, avatarTwoPath);
    if (!avtTwo) avtTwo = await placeholderAvatar(avatarTwoPath);

    const baseImage = await jimp.read(bgPath);
    const circleOne = await jimp.read(await circle(avtOne));
    const circleTwo = await jimp.read(await circle(avtTwo));

    baseImage
        .resize(500, 500)
        .composite(circleOne.resize(100, 100), 360, 28)
        .composite(circleTwo.resize(70, 70), 131, 165);

    const raw = await baseImage.getBufferAsync("image/png");
    fs.writeFileSync(pathImg, raw);
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
        name: "xnx",
        author: "JOY AHMED",
        role: 0,
        usePrefix: true,
        cooldown: 5,
        description: "Make a romantic love frame with someone you mention"
    },

    onStart: async function ({ bot, chatId, userId, msg, args }) {
        const messageId = msg ? msg.message_id : undefined;

        const target = resolveTarget(msg, args);
        if (!target) {
            return bot.sendMessage(
                chatId,
                "❗ Please mention 1 person.\n\n👉 Karo message e reply diye /xnx likho,\n👉 othoba mention picker theke naam select kore /xnx likho,\n👉 othoba /xnx <user_id> dao.",
                { reply_to_message_id: messageId }
            );
        }

        const one = userId;
        const two = target.id;
        const targetName = target.first_name || "User";

        try {
            const imagePath = await makeImage(bot, one, two);
            await bot.sendPhoto(chatId, imagePath, {
                caption: `╭╼|━━━━━━━━━━━━━━|╾╮\n│  💞 ${targetName}\n╰╼|━━━━━━━━━━━━━━|╾╯`,
                reply_to_message_id: messageId
            });
            fs.unlinkSync(imagePath);
        } catch (err) {
            console.error("xnx command error:", err.message);
            return bot.sendMessage(
                chatId,
                `⚠️ Error: ${err.message}`,
                { reply_to_message_id: messageId }
            );
        }
    }
};
