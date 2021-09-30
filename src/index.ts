/*
todo: permissions based commands
*/
import * as Discord from 'discord.js'
import { REST } from '@discordjs/rest';
import { Routes} from 'discord-api-types/v9'

import { getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { queryConfig, getCommands} from './util'
import type { BotClient, SlashCommandDataJSON } from '../typings/index';
var cron = require('node-cron');

const rest = new REST({ version: '9'});
const client = new Discord.Client({
    intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MEMBERS']
}) as BotClient;
const CLIENT_ID = '464186918457049088';

client.commands = new Map();
client.musicQueue = [];
client.audioPlayers = new Map();

client.once('ready', async () => {
    if (client.user)
    console.log(`Succesfully logged into ${client.user.tag}`);
    
    let commands = await getCommands();
    client.commands = commands;

    let data: SlashCommandDataJSON[] = [];
    for (let [k,v] of commands) {            
        console.log(`Pushing ${k} to commands`);
        data.push(v.data.toJSON())
    }

    if (process.env.NODE_ENV == 'dev') {
        /* debugging guilds */
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, '378778569465266197'), { body: data });
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, '676293029879087104'), { body: data });
    } else {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: data });
    }
    await client.application?.commands.fetch();
    console.log(`Loaded ${client.application?.commands.cache.size} commands.`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() || !interaction.guild) return;
    const command = interaction.commandName;
    try {
        client.commands.get(command)?.execute(interaction);
    } catch (e) {
        console.log(e);
        interaction.webhook.send(`OOPSIE WOOPSIE!! Uwu We make a fucky wucky!! A wittle fucko boingo! The code monkeys <@148521718388883456> at our headquarters are working VEWY HAWD to fix this! There was an error executing \`${command}\`.\nStacktrace: \`\`\`${e.stack}\`\`\``)
    }
});


client.on('messageCreate', message => {
    if (message.author.id == '359112475066499083' && message.content.startsWith('refresh')) {
        console.log('Refresh Called');
        client.application?.commands.fetch().then(async cmds => {
            for (const cmd of cmds) await client.application?.commands.delete(cmd[1]);
            console.log('Refresh - Removed all commands');
        })
    }
});

// AFK Timeout (5 minutes)
client.on('voiceStateUpdate', (pre, next) => {
    let connection = getVoiceConnection(pre.guild.id);
    if (client.musicQueue.length == 0 && connection) {
        let channelId = connection?.joinConfig.channelId;
        if (channelId == pre.channel?.id &&
            (!(pre.channel?.members.size) || pre.channel.members.size < 2))
                client.channelTimeout = setTimeout(() => { connection!.destroy() }, 300000);
    }
});

cron.schedule('46 * * * *', async () => {
    joinVoiceChannel({
        channelId: '836294655964348417',
        guildId: '378778569465266197',
        adapterCreator: client.guilds.cache.get('378778569465266197')!.voiceAdapterCreator
    });
    await new Promise(r => setTimeout(r, 1000));
    let connection = getVoiceConnection('378778569465266197');
    connection?.destroy();
});

queryConfig().then(config => {
    let token = config.token;
    if (process.env.NODE_ENV == 'dev') token = config.testToken;
    console.log(`Logging in with token ***********${token.slice(-8)}`);
    rest.setToken(token)
    client.login(token);
});