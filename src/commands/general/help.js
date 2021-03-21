const { helpAllEmbed, helpEmbed } = require('../../embeds/types.js');

module.exports = {
    name: 'help',
    category: 'General',
    description: 'Sends a list of commands',
    usage: '[command name]',

    execute(message, args) {
        const { commands } = message.client;
        if (!(args) || !(args.length)) {
            let embed = helpAllEmbed(commands);
            message.channel.send(embed);
        } else {
            let commandName = args[0];
            if (!commands.has(commandName) || args.length > 1) {
                message.channel.send('That command does not exist.');
                return;
            }
            let embed = helpEmbed(commandName, commands.get(commandName));
            message.channel.send(embed);
        }
    },
};