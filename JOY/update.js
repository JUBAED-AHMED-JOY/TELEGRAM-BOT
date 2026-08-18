const axios = require('axios');
const path = require('path');
const pkg = require(path.join(__dirname, '..', 'package.json'));

// ================= VERSION CHECK =================
// Compares the local package.json version against a remote version file.
// If the remote file can't be reached (offline, no repo configured, etc.)
// this fails silently so the bot always starts.

const REMOTE_VERSION_URL = 'https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/version.txt';

module.exports = async function checkVersion() {
    try {
        const res = await axios.get(REMOTE_VERSION_URL, { timeout: 4000 });
        const remoteVersion = (res.data || '').toString().trim();

        if (remoteVersion && remoteVersion !== pkg.version) {
            console.log(`\n A new version is available: ${remoteVersion} (current: ${pkg.version})\n`);
        } else {
            console.log(` Running latest version: ${pkg.version}`);
        }
    } catch (err) {
        console.log(` Version check skipped (offline or no update source). Running v${pkg.version}`);
    }
};
