const Discord = require('discord.js');
const fs = require('fs');

const embedDir = fs.readdirSync('./embeds/').filter(file => file.endsWith('.js'));
let embeds = new Discord.Collection();

for (const file of embedDir) {
    if (!(file == 'types.js')) {
        const embed = require(`./${file}`);
        embeds.set(embed.name, embed);
    }
}

console.log(embeds);

module.exports = {
    helpAllEmbed(commands) {
        return embeds.get('helpAllEmbed').createEmbed(commands);
    },
    helpEmbed(commandName, command) {
        return embeds.get('helpEmbed').createEmbed(commandName, command);
    }
};