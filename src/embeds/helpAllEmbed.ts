import * as Discord from 'discord.js';
import { DiscordCommand } from '../../typings';


// todo: fix these relative paths
const { pfpURL } = require('../../config.json');
module.exports = {
    name: 'helpAllEmbed',
    createEmbed(commands: Discord.Collection<string, DiscordCommand>) {
        let embed = new Discord.MessageEmbed()
            .setColor('#dddddd')
            .setTitle('Bot Documentation')
            .setThumbnail(pfpURL)
            .setFooter('Bucket Hat Bot', 'https://cdn.discordapp.com/avatars/783886978974220338/9e5abce14cce133de8c6145e556ee725.png?size=32')
            .setTimestamp()

        let sortedByCategory: Discord.Collection<string, Array<String>> = new Discord.Collection();
        for (const command of commands) {
            let category = command[1].category;
            
            // check if category exists
            if (!(sortedByCategory.has(category))) sortedByCategory.set(category, []);
            // @ts-expect-error how do i get rid of this
            sortedByCategory.get(category).push(`• ${command[1].name}`);

        
        }
        
        for (const [k, v] of sortedByCategory) {
            let numFields = embed.fields.length;
            if (numFields % 3 == 0 && numFields > 0) embed.addField(k ,v.join('\n'), false);
            else embed.addField(k, v.join(' '), true);
        }
        return embed.addField('\u200B', ' See more about a specific command using `help [command]`');
    }
};