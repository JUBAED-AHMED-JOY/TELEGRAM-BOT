const gradient = require('gradient-string');

// ================= JOY CONSOLE BANNER =================
const banner = `
     ██╗ ██████╗ ██╗   ██╗
     ██║██╔═══██╗╚██╗ ██╔╝
     ██║██║   ██║ ╚████╔╝
██   ██║██║   ██║  ╚██╔╝
╚█████╔╝╚██████╔╝   ██║
 ╚════╝  ╚═════╝    ╚═╝
        TELEGRAM BOT FRAMEWORK
`;

try {
    console.log(gradient.pastel(banner));
} catch {
    console.log(banner);
}

module.exports = true;
