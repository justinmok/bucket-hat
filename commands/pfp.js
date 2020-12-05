module.exports = {
    name: 'pfp',
    category: 'General',
    description: 'Retrieve profile picture of desired user',
    usage: '[@user]',
    execute(message, args) {
        if (!args.length) return;
        let user = message.mentions.members.first().user;
        let id = user.id;
        let hash = user.avatar;
        message.channel.send(`https://cdn.discordapp.com/avatars/${id}/${hash}.png?size=512`);
    }
};