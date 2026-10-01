// মেমোরিতে ডাটা রাখার জন্য অবজেক্ট (কোনো ফাইল সিস্টেম লাগবে না)
const userHistory = new Map();

module.exports = {
    config: {
        name: "nameTracker",
        version: "1.0.0",
        author: "Joy Ahmed",
        description: "Detects name and username changes within 30 days without external file storage"
    },

    handleEvent: async function ({ event, bot }) {
        const msg = event.msg;
        if (!msg || !msg.from || msg.from.is_bot) return;

        const userId = msg.from.id.toString();
        const chatId = msg.chat.id;
        const currentFirstName = msg.from.first_name || "No Name";
        const currentUsername = msg.from.username ? `@${msg.from.username}` : "No Username";
        const now = Date.now();
        const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000; // ৩০ দিন (মিলিসেকেন্ড)

        // যদি ইউজারের আগের ডাটা মেমোরিতে না থাকে
        if (!userHistory.has(userId)) {
            userHistory.set(userId, {
                firstName: currentFirstName,
                username: currentUsername,
                lastUpdated: now
            });
            return;
        }

        const userData = userHistory.get(userId);
        const oldFirstName = userData.firstName;
        const oldUsername = userData.username;
        const lastUpdated = userData.lastUpdated || 0;

        const isNameChanged = oldFirstName !== currentFirstName;
        const isUsernameChanged = oldUsername !== currentUsername;
        const isWithinOneMonth = (now - lastUpdated) <= ONE_MONTH_MS;

        // গত ৩০ দিনের মধ্যে নাম বা ইউজারনেম চেঞ্জ হলে অ্যালার্ট সেন্ড করবে
        if ((isNameChanged || isUsernameChanged) && isWithinOneMonth) {
            
            const currentDate = new Date().toLocaleString('en-US', { 
                timeZone: 'Asia/Dhaka',
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
                hour12: true 
            });

            const alertText = 
`🚨 <b>USERLOCK DETECTED!</b>
━━━━━━━━━━━━━━━━━━
👤 <b>নাম:</b> ${currentFirstName} 
🆔 <b>আইডি:</b> <code>${userId}</code>
🔗 <b>মেনশন:</b> <a href="tg://user?id=${userId}">${currentFirstName}</a>
━━━━━━━━━━━━━━━━━━

📝 <b>পরিবর্তন বিবরণ:</b>
• <b>First:</b> ${oldFirstName} → ${currentFirstName}
• <b>Username:</b> ${oldUsername} → ${currentUsername}

━━━━━━━━━━━━━━━━━━
⏰ <code>${currentDate}</code>`;

            // গ্রুপে মেসেজ পাঠানো
            await bot.sendMessage(chatId, alertText, {
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });

            // মেমোরিতে ডাটা আপডেট
            userHistory.set(userId, {
                firstName: currentFirstName,
                username: currentUsername,
                lastUpdated: now
            });
        } else if (!isWithinOneMonth && (isNameChanged || isUsernameChanged)) {
            // ৩০ দিনের বেশি হয়ে গেলে সাইলেন্টলি মেমোরিতে ডাটা আপডেট করবে
            userHistory.set(userId, {
                firstName: currentFirstName,
                username: currentUsername,
                lastUpdated: now
            });
        }
    }
};
