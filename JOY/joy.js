/**
 * JOY BOT CORE HELPER FUNCTIONS & STYLISH MESSAGES
 * Developer: Joy Ahmed
 */

function getInvalidCmdMsg(prefix, inputCmdName) {
    return `╭───❍ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 ❍───
│
├➤ ❌ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗡𝗼𝘁 𝗙𝗼𝘂𝗻𝗱!
├➤ 🔍 𝗜𝗻𝗽𝘂𝘁 : 「 ${prefix}${inputCmdName} 」
├➤ 💡 𝗧𝘆𝗽𝗲 ${prefix}𝗵𝗲𝗹𝗽 𝗳𝗼𝗿 𝗮𝗹𝗹 𝗰𝗺𝗱𝘀
│
╰──────────────────────────
🌿 ★ 𝗝𝗢𝗬-𝗧𝗚-𝗕𝗢𝗧 ★
𝗕𝗢𝗧 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 𝗝𝗢𝗬 𝗔𝗛𝗠𝗘𝗗`;
}

module.exports = {
    getInvalidCmdMsg
};
