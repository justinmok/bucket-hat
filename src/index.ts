/*
todo: permissions based commands
*/
import * as Discord from 'discord.js'
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
    console.log
    client.commands = commands;

    await client.application?.commands.fetch(undefined, true, true);
    console.log(`Loaded ${client.application?.commands.cache.size} commands.`);
});

client.on('interaction', async interaction => {
    if (!interaction.isCommand() || !interaction.guild) return;
    const command = interaction.commandName;
    try {
        client.commands.get(command)?.execute(interaction);
    } catch (e) {
        console.log(e);
        interaction.webhook.send(`OOPSIE WOOPSIE!! Uwu We make a fucky wucky!! A wittle fucko boingo! The code monkeys <@148521718388883456> at our headquarters are working VEWY HAWD to fix this! There was an error executing \`${command}\`.\nStacktrace: \`\`\`${e.stack}\`\`\``)
    }
});

client.on('message', message => {
    if (message.author.id == '148521718388883456' && message.content.startsWith('refresh')) {
        console.log('refreshing commands');
        client.application?.commands.fetch().then(cmds => {
            cmds.forEach(cmd => client.application?.commands.delete(cmd));
            client.commands.forEach(cmd => {
                console.log('adding', cmd.name);
                client.application?.commands.create({
                    name: cmd.name,
                    description: cmd.description,
                    options: cmd.options ?? null
                });
            });
        })
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