module.exports = {
    config: {
        name: 'welcomeNewMember'
    },

    async handleEvent({ event, api }) {
        const msg = event.msg;
        if (!msg || !msg.new_chat_members) return;

        const chatId = msg.chat.id;

        for (const member of msg.new_chat_members) {
            if (member.is_bot) continue;
            await api.sendMessage(chatId, ` Welcome ${member.first_name} to the group!`);
        }
    }
};
