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

        let sortedByCategory = new Discord.Collection();
        for (const command of commands) {
            let category = command[1].category;
            // check if category exists
            if (!(sortedByCategory.has(category))) sortedByCategory.set(category, []);
            sortedByCategory.get(category).push(`• ${command[1].name}`);
        }
        
        for (const [k, v] of sortedByCategory) {
            let numFields = embed.fields.length;
            if (numFields % 3 == 0 && numFields > 0) embed.addField(k ,v.join('\n'), false);
            else embed.addField(k, v.join('\n'), true);
        }
        return embed.addField('\u200B', ' See more about a specific command using `help [command]`');
    }
};