import * as Discord from 'discord.js';
import type { QueueItem } from '../../typings/index';

module.exports = {
    name: 'queueEmbed',
    createEmbed(queue: Array<QueueItem>) {
        let { url } = queue[0].match.bestThumbnail;
        let embed = new Discord.MessageEmbed()
            .setColor('#dddddd')
            .setTitle('Music Queue')
            .setTimestamp()
        
        if (typeof url == 'string') embed.setThumbnail(url);
        
        queue.map((queueItem: QueueItem, index) => {
            let { match, requester } = queueItem;
            embed.addField(`#${index+1} ${match.title}`, (!requester) ? '': 'Requested by ' + requester.displayName);
        });
        return embed;
    }
};