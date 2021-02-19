const { queueEmbed } = require('../../embeds/types.js');

/* TODO:
search in queue
queue controls as reactions (remove, up, down, duplicate)
*/
module.exports = {
    name: 'queue',
    category: 'General',
    description: 'Sends a list of commands',
    usage: '[position]',

    execute(message, args) {
        const { musicQueue } = message.client;
        if (!musicQueue.length) return;
        if (args.length == 0) {
            let embed = queueEmbed(musicQueue);
            message.channel.send(embed);
        } 
    },
};