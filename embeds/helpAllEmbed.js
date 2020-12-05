const Discord = require('discord.js');
const { pfpURL } = require('../config.json');
module.exports = {
    name: 'helpAllEmbed',
    createEmbed(commands) {
        let embed = new Discord.MessageEmbed()
            .setColor('#dddddd')
            .setTitle('Bot Documentation')
            .setThumbnail(pfpURL)
            .setTimestamp()
            .setFooter('Written by vibrant#0001');

        let commandsList = [];
        for (const command of commands) {
            commandsList.push(`${command[1].name} - ${command[1].description}`);
        }
        
        
        return embed.addField('Commands', commandsList.join('\n'));
    }
};