// ================= GLOBAL UTILS =================
// Small shared helpers used across commands/events.

global.utils = {
    /** Format milliseconds into a human readable "Xh Ym Zs" string */
    formatTime(ms) {
        const s = Math.floor(ms / 1000) % 60;
        const m = Math.floor(ms / (1000 * 60)) % 60;
        const h = Math.floor(ms / (1000 * 60 * 60));
        return `${h}h ${m}m ${s}s`;
    },

    /** Get bot uptime as a formatted string */
    getUptime() {
        return this.formatTime(process.uptime() * 1000);
    },

    /** Simple random pick from array */
    randomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    /** Sleep helper for async/await */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

module.exports = global.utils;
