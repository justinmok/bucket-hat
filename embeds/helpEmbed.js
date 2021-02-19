const Discord = require('discord.js');
const { pfpURL } = require('../config.json');

module.exports = {
    name: 'helpEmbed',
    createEmbed(commandName, command) {
        let embed = new Discord.MessageEmbed()
            .setColor('#dddddd')
            .setTitle('Bot Documentation')
            .setThumbnail(pfpURL)
            .setTimestamp()
            .setFooter('Written by vibrant#0001')
            .addField(`${commandName} command`, `${command.description}`)
            .addField('Usage', `\`${command.usage}\``);
        
        return embed;
    }
};