module.exports = {
    config: {
        name: 'leftMember'
    },

    async handleEvent({ event, api }) {
        const msg = event.msg;
        if (!msg || !msg.left_chat_member) return;

        const chatId = msg.chat.id;
        const member = msg.left_chat_member;
        if (member.is_bot) return;

        await api.sendMessage(chatId, ` ${member.first_name} left the group.`);
    }
};
