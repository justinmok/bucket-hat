import { MessageEmbed } from 'discord.js';
import type { QueueItem } from '../commands/utils/musicUtils';

type EmbedOptions = {
    page: number,
};
export const createEmbed = (queueItems: QueueItem[], options: EmbedOptions = { page: 1 }): Promise<MessageEmbed> => {
    return new Promise<MessageEmbed>((resolve) => {
        let currentSong = queueItems[0].match;
        let { url } = currentSong.thumbnails[0];
        let embed = new MessageEmbed()
            .setColor('#dddddd')
            .setTitle('Currently playing:')
            .setTimestamp()
            .setDescription(`[**${currentSong.title}**](${currentSong.url}) (${currentSong.duration})\nRequested by ${queueItems[0].requester?.displayName}`)
            .setFooter({ text: 'bucket hat bot', iconURL: 'https://cdn.discordapp.com/avatars/783886978974220338/9e5abce14cce133de8c6145e556ee725.png?size=32'})

        if (url) embed.setThumbnail(url);
        
        let minIndex = (options.page - 1) * 5;
        let maxIndex = (options.page * 5);
        console.log(`[${minIndex}, ${maxIndex}]`);
        queueItems.slice(minIndex, maxIndex).forEach((queueItem: QueueItem, index) => {
            let { match, requester } = queueItem;
            if (index == 0) return;
            embed.addField(`#${minIndex + index +1} ${match.title}`, `Requested by ${requester.displayName} ([Link](${match.url}))`);
        });
        resolve(embed);
    });
};