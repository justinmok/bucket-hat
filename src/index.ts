import Discord = require('discord.js');
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9'
import { getVoiceConnection } from '@discordjs/voice';

import { queryConfig, getCommands } from './util'
import { logger } from './log'
import type { SlashCommandDataJSON } from '../typings/index';

const rest = new REST({ version: '9' });
const client = new Discord.Client({
    intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MEMBERS']
});

enum ClientEnums {
    AFK_TIMEOUT_MINUTES = 5,
    DEV_SERVER_ID = '676293029879087104',
    TANK_SERVER_ID = '378778569465266197', // fish tank server
    TEST_CLIENT_ID = '464186918457049088',
    PROD_CLIENT_ID = '783886978974220338',
}

client.commands = new Map();
client.musicQueue = [];
client.audioPlayers = new Map();
client.logger = logger;

/* Load commands after client initialized */
client.once('ready', async () => {
    if (client.user)
        client.logger.log({
            level: 'info',
            label: 'main',
            message: `Succesfully logged into ${client.user.tag}`
        });

    let commands = await getCommands();
    client.commands = commands;

    let data: SlashCommandDataJSON[] = [];
    for (let [k, v] of commands) {
        data.push(v.data.toJSON())
    }

    if (process.env.NODE_ENV == 'dev') {
        /* debugging guilds */
        await rest.put(Routes.applicationGuildCommands(ClientEnums.TEST_CLIENT_ID, ClientEnums.TANK_SERVER_ID), { body: data });
        await rest.put(Routes.applicationGuildCommands(ClientEnums.TEST_CLIENT_ID, ClientEnums.DEV_SERVER_ID), { body: data });
    } else {
        await rest.put(Routes.applicationCommands(ClientEnums.PROD_CLIENT_ID), { body: data });
    }

    await client.application?.commands.fetch();
    client.logger.log({
        level: 'info',
        label: 'main',
        message: `Loaded ${client.application?.commands.cache.size} commands.`
    });
});

/* Main command handler */
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() || !interaction.guild) return;
    const command = interaction.commandName;
    try {
        client.commands.get(command)!.execute(interaction);
        client.logger.log({
            level: 'verbose',
            label: 'main',
            guild: interaction.guild,
            channel: interaction.channel,
            user: interaction.user,
            message: `Ran command ${command}`
        });
    } catch (e) {
        client.logger.log({
            level: 'error',
            label: 'main',
            message: e
        });
    }
});

/* Remove all commands and kill process */
client.on('messageCreate', message => {
    let hasPermissions = message.member?.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR);
    if (hasPermissions && message.content.startsWith('.refresh')) {
        client.logger.log({
            level: 'info',
            label: 'main',
            message: `Application command refresh called by ${message.author.username}!`
        });
        client.application?.commands.fetch().then(async cmds => {
            for (const cmd of cmds) await client.application?.commands.delete(cmd[1]);
        }).finally(() => process.exit(-1));
    }
});

/* AFK Timeout (5 minutes) */
client.on('voiceStateUpdate', (pre) => {
    let connection = getVoiceConnection(pre.guild.id);
    if (client.musicQueue.length == 0 && connection) {
        let channelId = connection!.joinConfig.channelId,
            beforeChannelId = pre.channel?.id,
            isAlone = (!(pre.channel?.members.size) || pre.channel.members.size < 2);
        if (channelId == beforeChannelId && isAlone) {
            /* Leave channel after 5 minutes */
            setTimeout(() => { connection!.destroy() }, ClientEnums.AFK_TIMEOUT_MINUTES * 60 * 1000); 
        }
    }
});

queryConfig().then(config => {
    let token = config.token;
    if (process.env.NODE_ENV == 'dev') token = config.testToken;
    client.logger.log({
        level: 'info',
        label: 'main',
        message: `Logging in with token ***********${token.slice(-8)}`
    });
    rest.setToken(token)
    client.login(token);
});