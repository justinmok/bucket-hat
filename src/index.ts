/*
todo: dockerize, permissions based commands, categorize help menu, help menu pagination, AI stop session intent
*/
const Discord = require('discord.js');
const fs = require('fs');

import type { BotClient } from '../typings/index';

//const speech = require('@google-cloud/speech');

let config = require('../config.json');
let prefixes = require('../prefixes.json');

const { token, defaultPrefix, cloudProjectID } = config;

const client = new Discord.Client() as BotClient;
//const speechClient = new speech.SpeechClient();

client.defaultPrefix = defaultPrefix;
client.commands = new Discord.Collection();
client.prefixes = new Discord.Collection();
client.musicQueue = [];
client.cloudProjectId = cloudProjectID;


for (const [server, prefix] of Object.entries(prefixes)) {
    client.prefixes.set(server, <string>prefix);
}

let commandsFolder = fs.readdirSync('./commands').filter(dir => !dir.includes('utils'));
for (const folder of commandsFolder) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

console.log(`Loaded ${client.commands.size} commands.`);

client.once('ready', () => {
    if (client.user)
    console.log(`Succesfully logged into ${client.user.tag}`);
});

client.on('message', message => {

    /* Get the guild ID */
    let messageGuild = message.guild?.id ?? '';

    /* Get the prefix for the guild */
    const prefix = client.prefixes.get(messageGuild) ?? defaultPrefix;

    /* Message checks */
    if (message.author.bot || !(messageGuild) || !(message.content.startsWith(prefix))) return;
    if (message.author.id == '432610292342587392' && message.embeds[0] != undefined) message.react('😄');
    
    /* Retrieving command info */
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase() ?? '';

    /* Command does not exist */
    if (!client.commands.has(command)) return;

    /* Update prefixes */
    client.prefixes.forEach((guild, prefix) => prefixes[prefix] = guild);
    fs.writeFileSync('../prefixes.json', JSON.stringify(prefixes, null, 4));

    /* Execute command */
    try {
        client.commands.get(command)?.execute(message, args);
    } catch (error) {
        console.log(error);

        /* User feedback, logs error to file */
        message.channel.send(`OOPSIE WOOPSIE!! Uwu We make a fucky wucky!! A wittle fucko boingo! The code monkeys at our headquarters are working VEWY HAWD to fix this! There was an error executing \`${command}\`.\nStacktrace: \`\`\`${error.stack}\`\`\``).then(() => {
            fs.writeFileSync(`./logs/${Date.now()}.error.log`, error);
        });
    }
});

console.log(`Logging in with token ***********${token.slice(-8)}`);
client.login(token);