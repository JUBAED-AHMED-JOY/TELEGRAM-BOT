/* ============================================================
   WELCOME EVENT v5 — gift style, chilmil background (JOY AHMED)
   - Background: diagonal royal-blue -> dark-teal gradient
     + glow + GHONO sparkle + glowing star + gold corner + gift box
   - Title: gold gradient, letter-spaced, stylish font (WELCOME)
   - 2 side e 2 ta profile pic: bam e NEW MEMBER, dan e ADDED BY
   - Image teo sob info: Group, Member No, Developer, TIME, DATE/DAY
   - Text card: sob label stylish (bold) font e, sob info soho
   - FIX: image er lekha theke emoji/symbol auto bad jay
     (Jimp font e oigula nai, nahole ???? dekhato)
   - "A GIFT FOR YOU" lekha image theke kata hoyeche
     (gift box decoration + caption er gift line roise)

   Install:  package.json er dependencies e thakte hobe:
             "jimp": "^0.22.12"
   Repo te JOY-CMDS/events/welcomeNewMember.js file ta
   ei file diye replace koro.
   ============================================================ */

const axios = require('axios');
const Jimp = require('jimp');

const W = 1280, H = 720;
const CYAN = 0x00E5FFFF;
const MAGENTA = 0xFF2D95FF;
const GREEN = 0x39FF8CFF;
const GOLD = 0xFACC15FF;
const DARK_DISC = 0x1E293BFF;

let _font128 = null;
let _font32 = null;
let _font128Black = null;

async function fonts() {
    if (!_font128) _font128 = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
    if (!_font32) _font32 = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    if (!_font128Black) _font128Black = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);
    return { f128: _font128, f32: _font32, f128b: _font128Black };
}

/* Image font e sudhu English letter/number/chinho ache.
   Emoji, flag, Bangla ba onno symbol thakle ???? dekhay,
   tai image er lekha theke oigula agei bad dewa hoy.
   (Caption e puro nam thik thake, Telegram oigula dekhate pare.) */
function safeText(str) {
    return (str || '').toString().replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim();
}

function short(name, limit) {
    name = safeText(name) || '?';
    if (name.length > limit) return name.slice(0, limit - 3) + '...';
    return name;
}

function centerX(font, text) {
    return Math.floor((W - Jimp.measureText(font, text)) / 2);
}

/* Caption er jonno stylish bold font (Unicode): sudhu label e use hoy,
   UID/username normal thake jate copy kora jay. */
function bold(text) {
    return text.split('').map(ch => {
        const c = ch.charCodeAt(0);
        if (c >= 65 && c <= 90) return String.fromCodePoint(0x1D400 + c - 65);
        if (c >= 97 && c <= 122) return String.fromCodePoint(0x1D41A + c - 97);
        if (c >= 48 && c <= 57) return String.fromCodePoint(0x1D7CE + c - 48);
        return ch;
    }).join('');
}

/* Avatar buffer -> gol circle (ring color diye). Photo na thakle
   initial letter er placeholder circle banay. */
async function avatarCircle(buffer, diameter, ringColor, initial) {
    const ring = 8;
    const size = diameter + ring * 2;
    const disc = new Jimp(size, size, ringColor);
    disc.circle();
    let face;
    if (buffer) {
        try {
            face = await Jimp.read(buffer);
            face.cover(diameter, diameter).circle();
        } catch (e) {
            face = null;
        }
    }
    if (!face) {
        const { f128 } = await fonts();
        face = new Jimp(diameter, diameter, DARK_DISC);
        face.circle();
        const letter = (safeText(initial).slice(0, 1) || '?').toUpperCase();
        const tw = Jimp.measureText(f128, letter);
        const th = Jimp.measureTextHeight(f128, letter, diameter);
        face.print(f128, Math.floor((diameter - tw) / 2),
            Math.floor((diameter - th) / 2), letter);
    }
    disc.composite(face, ring, ring);
    return disc;
}

/* Gold gradient, letter-spaced title banay (mask trick). */
async function goldTitle(text, spacing) {
    const { f128, f128b } = await fonts();
    let w = 0;
    for (const ch of text) w += Jimp.measureText(f128, ch);
    w += spacing * (text.length - 1);
    const h = Jimp.measureTextHeight(f128, text, w) + 20;

    const grad = new Jimp(w, h);
    grad.scan(0, 0, w, h, function (x, y, idx) {
        const t = x / w;
        this.bitmap.data[idx] = Math.round(253 + (245 - 253) * t);
        this.bitmap.data[idx + 1] = Math.round(230 + (158 - 230) * t);
        this.bitmap.data[idx + 2] = Math.round(138 + (11 - 138) * t);
        this.bitmap.data[idx + 3] = 255;
    });

    const mask = new Jimp(w, h, 0x00000000);
    let x = 0;
    for (const ch of text) {
        mask.print(f128, x, 0, ch);
        x += Jimp.measureText(f128, ch) + spacing;
    }
    grad.mask(mask, 0, 0);

    // Shadow er jonno kalo title + tar upore gold title
    const shadow = new Jimp(w, h, 0x00000000);
    x = 0;
    for (const ch of text) {
        shadow.print(f128b, x, 0, ch);
        x += Jimp.measureText(f128b, ch) + spacing;
    }
    const out = new Jimp(w + 6, h + 6, 0x00000000);
    out.composite(shadow, 5, 5);
    out.composite(grad, 0, 0);
    return out;
}

/* Choto gift box decoration (corner er jonno). */
function giftBox() {
    const img = new Jimp(90, 80, 0x00000000);
    img.composite(new Jimp(80, 55, MAGENTA), 5, 22);        // box body
    img.composite(new Jimp(88, 14, GOLD), 1, 10);            // lid
    img.composite(new Jimp(12, 55, GOLD), 39, 22);           // ribbon vertical
    img.composite(new Jimp(80, 10, GOLD), 5, 44);            // ribbon horizontal
    const bow1 = new Jimp(22, 22, GOLD); bow1.circle();
    const bow2 = new Jimp(22, 22, GOLD); bow2.circle();
    img.composite(bow1, 22, 0);
    img.composite(bow2, 48, 0);
    img.composite(new Jimp(10, 10, GOLD), 40, 6);            // knot
    return img;
}

/* Main image builder. Test er jonno module theke export kora ache. */
async function buildWelcomeImage(memberAvatar, adderAvatar, opts) {
    const { f32 } = await fonts();
    const { memberName, adderName, groupName, memberNo, timeStr, dateStr } = opts;

    // Background: diagonal royal-blue (upore-bam) -> dark-teal (niche-dan)
    const img = new Jimp(W, H);
    img.scan(0, 0, W, H, function (x, y, idx) {
        const t = (x / W + y / H) / 2;
        this.bitmap.data[idx] = Math.round(10 + (3 - 10) * t);
        this.bitmap.data[idx + 1] = Math.round(42 + (14 - 42) * t);
        this.bitmap.data[idx + 2] = Math.round(107 + (24 - 107) * t);
        this.bitmap.data[idx + 3] = 255;
    });

    // Avatar er pichone soft glow (avatar center e)
    const glowL = new Jimp(330, 330, 0x00E5FF33); glowL.circle();
    const glowR = new Jimp(330, 330, 0x39FF8C33); glowR.circle();
    img.composite(glowL, 320 - 165, 235 + 123 - 165);
    img.composite(glowR, 960 - 165, 235 + 123 - 165);

    // Sparkle / confetti (ghono, chilmil korar jonno)
    const sparkColors = [0xFFFFFFCC, 0x00E5FFAA, 0xFACC15AA, 0xFF2D95AA, 0x39FF8CAA];
    for (let i = 0; i < 130; i++) {
        const s = 2 + (i % 4) * 2;
        const dot = new Jimp(s, s, sparkColors[i % sparkColors.length]);
        dot.circle();
        img.composite(dot, (i * 173 + 53) % (W - 40) + 20, (i * 97 + 29) % (H - 40) + 20);
    }
    // Glowing star: boro halka disc + majhe ujjol core
    for (let i = 0; i < 12; i++) {
        const col = sparkColors[i % sparkColors.length];
        const sx = (i * 337 + 101) % (W - 120) + 60;
        const sy = (i * 211 + 67) % (H - 120) + 60;
        const halo = new Jimp(30, 30, ((col & 0xFFFFFF00) | 0x33) >>> 0); halo.circle();
        const core = new Jimp(7, 7, ((col & 0xFFFFFF00) | 0xFF) >>> 0); core.circle();
        img.composite(halo, sx - 15, sy - 15);
        img.composite(core, sx - 3, sy - 3);
    }

    // Border: bahire cyan mota, vitore magenta chikon
    img.composite(new Jimp(W, 6, CYAN), 0, 0);
    img.composite(new Jimp(W, 6, CYAN), 0, H - 6);
    img.composite(new Jimp(6, H, CYAN), 0, 0);
    img.composite(new Jimp(6, H, CYAN), W - 6, 0);
    img.composite(new Jimp(W - 36, 2, MAGENTA), 18, 18);
    img.composite(new Jimp(W - 36, 2, MAGENTA), 18, H - 20);
    img.composite(new Jimp(2, H - 36, MAGENTA), 18, 18);
    img.composite(new Jimp(2, H - 36, MAGENTA), W - 20, 18);

    // Gold corner accent (L shape, 4 corner e)
    const corners = [
        { hx: 30, hy: 30, vx: 30, vy: 30 },
        { hx: W - 100, hy: 30, vx: W - 36, vy: 30 },
        { hx: 30, hy: H - 36, vx: 30, vy: H - 100 },
        { hx: W - 100, hy: H - 36, vx: W - 36, vy: H - 100 }
    ];
    for (const c of corners) {
        img.composite(new Jimp(70, 6, GOLD), c.hx, c.hy);
        img.composite(new Jimp(6, 70, GOLD), c.vx, c.vy);
    }

    // Gift box 2 corner e
    img.composite(giftBox(), 55, H - 105);
    img.composite(giftBox(), W - 145, H - 105);

    // Gold stylish title (WELCOME thakbei)
    const title = await goldTitle('WELCOME', 14);
    img.composite(title, Math.floor((W - title.bitmap.width) / 2), 20);

    // Group name (A GIFT FOR YOU lekha kata hoyeche)
    const groupLine = short(groupName, 34);
    img.print(f32, centerX(f32, groupLine), 165, groupLine);

    // 2 side er 2 ta pic
    const dia = 230, cy = 235;
    const left = await avatarCircle(memberAvatar, dia, CYAN, memberName);
    const right = await avatarCircle(adderAvatar, dia, GREEN, adderName);
    img.composite(left, 320 - dia / 2 - 8, cy);
    img.composite(right, 960 - dia / 2 - 8, cy);

    // Label + nam
    img.print(f32, centerX(f32, 'NEW MEMBER') - 320, 495, 'NEW MEMBER');
    img.print(f32, centerX(f32, 'ADDED BY') + 320, 495, 'ADDED BY');
    const mName = short(memberName, 18);
    const aName = short(adderName, 18);
    img.print(f32, 320 - Jimp.measureText(f32, mName) / 2, 530, mName);
    img.print(f32, 960 - Jimp.measureText(f32, aName) / 2, 530, aName);

    // Nicher info line (sob info: group, member, developer, time, day/date)
    const info1 = 'GROUP: ' + short(groupName, 40);
    const info2 = 'MEMBER NO: ' + memberNo + '  |  DEVELOPER: JOY AHMED';
    const info3 = 'TIME: ' + timeStr + '  |  DATE: ' + dateStr;
    img.print(f32, centerX(f32, info1), 580, info1);
    img.print(f32, centerX(f32, info2), 615, info2);
    img.print(f32, centerX(f32, info3), 650, info3);

    return img.getBufferAsync(Jimp.MIME_PNG);
}

/* Telegram theke user er profile photo ana (na thakle null). */
async function fetchAvatar(bot, userId) {
    try {
        const photos = await bot.getUserProfilePhotos(userId);
        if (!photos || !photos.photos || photos.photos.length === 0) return null;
        const sizes = photos.photos[0];
        const fileId = sizes[sizes.length - 1].file_id;
        const url = await bot.getFileLink(fileId);
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(res.data);
    } catch (e) {
        return null;
    }
}

module.exports = {
    config: {
        name: 'welcome',
        author: 'JOY AHMED'
    },

    handleEvent: async function ({ event, bot }) {
        const msg = event.msg;

        // Message e notun member jukto hoyeche kina check
        if (!msg || !msg.new_chat_members || msg.new_chat_members.length === 0) return;

        const chatId = msg.chat.id;
        const groupTitle = msg.chat.title || 'Our Group';
        const adder = msg.from || null; // je add korse (raw message er sender)

        // Group e mot member songkha
        let memberCount = 'N/A';
        try {
            memberCount = await bot.getChatMemberCount(chatId);
        } catch (err) {
            console.error('Member count error:', err.message);
        }

        // Dhaka time/day-date (bar + tarikh, jemon "Sat, Oct 31, 2026")
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', {
            timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hour12: true
        });
        const dateStr = now.toLocaleDateString('en-US', {
            timeZone: 'Asia/Dhaka', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
        });

        for (const newMember of msg.new_chat_members) {
            // Bot nije join korle welcome jabe na
            if (newMember.is_bot) continue;

            const name = newMember.first_name || 'Member';
            const username = newMember.username ? '@' + newMember.username : 'No username';
            const addedBy = (adder && adder.id !== newMember.id)
                ? (adder.first_name + (adder.last_name ? ' ' + adder.last_name : ''))
                : 'Invite Link';

            const memberAvatar = await fetchAvatar(bot, newMember.id);
            const adderAvatar = (adder && adder.id !== newMember.id)
                ? await fetchAvatar(bot, adder.id)
                : null;

            // Image banano (fail hole sudhu text jabe)
            let imageBuffer = null;
            try {
                imageBuffer = await buildWelcomeImage(memberAvatar, adderAvatar, {
                    memberName: name,
                    adderName: addedBy,
                    groupName: groupTitle,
                    memberNo: memberCount,
                    timeStr: timeStr,
                    dateStr: dateStr
                });
            } catch (err) {
                console.error('Welcome image error:', err.message);
            }

            // Sob info soho stylish text card (label gulo stylish font e,
            // UID/username normal jate copy kora jay)
            const welcomeText =
                '✨ ' + bold('WELCOME TO OUR GROUP') + ' ✨\n\n' +
                '👤 ' + bold('Name') + ' : ' + name + '\n' +
                '🆔 ' + bold('UID') + ' : ' + newMember.id + '\n' +
                '📝 ' + bold('User') + ' : ' + username + '\n' +
                '🏰 ' + bold('Group') + ' : ' + groupTitle + '\n' +
                '🔢 ' + bold('Member No') + ' : ' + memberCount + '\n' +
                '➕ ' + bold('Added By') + ' : ' + addedBy + '\n' +
                '⏰ ' + bold('Time') + ' : ' + timeStr + '\n' +
                '📅 ' + bold('Date') + ' : ' + dateStr + '\n\n' +
                '🎁 ' + bold('A GIFT FOR YOU') + ' 🎁\n' +
                '💻 ' + bold('Developer') + ' : JOY AHMED';

            try {
                if (imageBuffer) {
                    await bot.sendPhoto(chatId, imageBuffer, { caption: welcomeText });
                } else {
                    await bot.sendMessage(chatId, welcomeText);
                }
            } catch (err) {
                console.error('Welcome send error:', err.message);
            }
        }
    },

    // Sudhu test er jonno (bot framework eta use kore na)
    _buildWelcomeImage: buildWelcomeImage
};
