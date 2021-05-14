import * as Discord from 'discord.js';
import type { QueueItem } from '../../typings/index';

module.exports = {
    name: 'queueEmbed',
    createEmbed(queue: Array<QueueItem>) {
        let currentSong = queue[0].match;
        let { url } = currentSong.thumbnails[0];
        let embed = new Discord.MessageEmbed()
            .setColor('#dddddd')
            .setTitle('Currently playing:')
            .setDescription(`[**${currentSong.title}**](${currentSong.url}) (${currentSong.duration})\nRequested by ${queue[0].requester?.displayName}`)
            .setFooter('Bucket Hat Bot', 'https://cdn.discordapp.com/avatars/783886978974220338/9e5abce14cce133de8c6145e556ee725.png?size=32')
            .setTimestamp()
        
        if (url) embed.setThumbnail(url);
        
        queue.map((queueItem: QueueItem, index) => {
            let { match, requester } = queueItem;
            if (index != 0) embed.addField(`#${index+1} ${match.title}`, `Requested by ${requester!.displayName} ([Link](${match.url}))`);
        });
        return embed;
    }
};