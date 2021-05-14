import * as Discord from 'discord.js';
import type { DiscordCommand } from '../../typings/index';

const { pfpURL } = require('../../config.json');

module.exports = {
    name: 'helpEmbed',
    createEmbed(commandName: string, command: DiscordCommand) {
        let embed = new Discord.MessageEmbed()
            .setColor('#dddddd')
            .setTitle('Bot Documentation')
            .setThumbnail(pfpURL)
            .setTimestamp()
            .addField(`${commandName} command`, `${command.description}`)
            .addField('Usage', `\`${command.usage}\``)
            .setFooter('Bucket Hat Bot', 'https://cdn.discordapp.com/avatars/783886978974220338/9e5abce14cce133de8c6145e556ee725.png?size=32');
        return embed;
    }
};