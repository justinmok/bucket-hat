import { MessageEmbed } from 'discord.js';
import type { QueueItem } from '../commands/utils/musicUtils';

export const createEmbed = (queueItems: QueueItem[]): Promise<MessageEmbed> => {
    return new Promise<MessageEmbed>((resolve, reject) => {
        let currentSong = queueItems[0].match;
        let { url } = currentSong.thumbnails[0];
        let embed = new MessageEmbed()
            .setColor('#dddddd')
            .setTitle('Currently playing:')
            .setDescription(`[**${currentSong.title}**](${currentSong.url}) (${currentSong.duration})\nRequested by ${queueItems[0].requester?.displayName}`)
            .setFooter('bucket hat bot', 'https://cdn.discordapp.com/avatars/783886978974220338/9e5abce14cce133de8c6145e556ee725.png?size=32')
            .setTimestamp()
        
        if (url) embed.setThumbnail(url);
        
        queueItems.map((queueItem: QueueItem, index) => {
            let { match, requester } = queueItem;
            if (index != 0) embed.addField(`#${index+1} ${match.title}`, `Requested by ${requester.displayName} ([Link](${match.url}))`);
        });
        resolve(embed);
    });
};