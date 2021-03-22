const Discord = require('discord.js');
const fs = require('fs');

const embedDir = fs.readdirSync('./embeds').filter(file => file.endsWith('.js'));

let embeds = new Discord.Collection();

for (const file of embedDir) {
    if (!(file == 'types.js')) {
        const embed = require(`./${file}`);
        embeds.set(embed.name, embed);
    }
}

module.exports = {
    helpAllEmbed(commands) {
        return embeds.get('helpAllEmbed').createEmbed(commands);
    },
    helpEmbed(commandName, command) {
        return embeds.get('helpEmbed').createEmbed(commandName, command);
    },
    queueEmbed(queue) {
        return embeds.get('queueEmbed').createEmbed(queue);
    }
};