/*
todo: permissions based commands
*/
import * as Discord from 'discord.js'
import * as fs from 'fs';
import { queryConfig, queryPrefixes, getCommands} from './util'

import type { BotClient } from '../typings/index';

const client = new Discord.Client({
    intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MEMBERS', 'GUILD_EMOJIS']
}) as BotClient;
client.commands = new Map();
client.prefixes = new Discord.Collection();
client.musicQueue = [];

// fetch prefixes
queryPrefixes().then(prefixes => {
    for (const [k, v] of prefixes) client.prefixes.set(k,v);
});

client.once('ready', async () => {
    if (client.user)
    console.log(`Succesfully logged into ${client.user.tag}`);
    
    let commands = await getCommands();
    client.commands = commands;
    console.log(`Loaded ${client.commands.size} commands.`);
    
    commands.forEach(cmd => {
        if (cmd.name !== 'play') return;
        client.application?.commands.create({
            name: cmd.name,
            description: cmd.description,
            options: cmd.options ?? null
        });
    });
});

client.on('interaction', async interaction => {
    console.log(interaction);
    if (!interaction.isCommand()) return;
    const command = interaction.commandName;
    client.commands.get(command)?.execute(interaction);
});

client.on('message', message => {
    console.log(client.application?.commands);
    /* Get the guild ID */
    let messageGuild = message.guild?.id ?? '';

    /* Get the prefix for the guild */
    const prefix = client.prefixes.get(messageGuild) ?? client.defaultPrefix;

    /* Message checks */
    if (message.author.id == '432610292342587392' && message.embeds[0] != undefined) message.react('😄');
    if (message.author.bot || !(messageGuild) || !(message.content.startsWith(prefix))) return;
    
    /* Retrieving command info */
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase() ?? '';

    /* Command does not exist */
    if (!client.commands.has(command)) return;

    /* Execute command */
    try {
        client.commands.get(command)?.execute(message, args);
    } catch (error) {
        console.log(error);

        /* User feedback, logs error to file */
        message.channel.send(`OOPSIE WOOPSIE!! Uwu We make a fucky wucky!! A wittle fucko boingo! The code monkeys <@148521718388883456> at our headquarters are working VEWY HAWD to fix this! There was an error executing \`${command}\`.\nStacktrace: \`\`\`${error.stack}\`\`\``).then(() => {
            fs.writeFileSync(`./logs/${Date.now()}.error.log`, error);
        });
    }
});

client.on('voiceStateUpdate', (pre, next) => {
    if (client.musicQueue.length == 0 &&
        client.voice?.connections.has(pre.guild.id) &&
        client.voice.connections.get(pre.guild.id)?.channel.id == pre.channel?.id &&
        pre.channel?.members.size == 1) {
            client.channelTimeout = setTimeout(() => {
                client.voice!.connections.get(pre.guild.id)?.channel.leave();
            }, 300000)
    }
});

queryConfig().then(config => {
    let token = config.token;
    client.defaultPrefix = config.defaultPrefix;
    if (process.env.NODE_ENV == 'dev') token = config.testToken;
    console.log(`Logging in with token ***********${token.slice(-8)}`);
    client.login(token);
});