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
            .addField('Usage', `\`${command.usage}\``);
        return embed;
    }
};