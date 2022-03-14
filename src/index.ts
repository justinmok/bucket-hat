import Discord = require('discord.js');
import { REST } from '@discordjs/rest';
import { getVoiceConnection } from '@discordjs/voice';
import { Routes } from 'discord-api-types/v9';
import type { SlashCommandDataJSON } from '../typings/index';
import { logger } from './log';
import { getCommands, queryConfig } from './util';

const rest = new REST({ version: '9' });
const client = new Discord.Client({
    intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MEMBERS']
});

enum ClientEnums {
    AFK_TIMEOUT_MINUTES = 5,
    DEV_SERVER_ID = '676293029879087104',
    TANK_SERVER_ID = '378778569465266197', /* fish tank server */
    TEST_CLIENT_ID = '464186918457049088',
    PROD_CLIENT_ID = '783886978974220338',
}

client.commands = new Map();
client.musicQueueManager = new Discord.Collection;
client.audioPlayers = new Map();
client.logger = logger;

/** Retrieve token from Firestore */
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

/** Load commands after client initialized */
client.once('ready', async () => {
    if (client.user)
        client.logger.log({
            level: 'info',
            label: 'main',
            message: `Succesfully logged into ${client.user.tag}`
        });

    const commands = await getCommands();
    client.commands = commands;

    let data: SlashCommandDataJSON[] = [];
    for (const [k, v] of commands) {
        data.push(v.data.toJSON())
    }

    if (process.env.NODE_ENV == 'dev') {
        /** debugging guilds */
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

/** Main command handler */
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
            message: e.stack
        });
    }
});

/** Remove all commands and kill process */
client.on('messageCreate', async message => {
    const hasPermissions = message.member?.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR);
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

    // quote channel cleaning up
    if (message.channel.id == '747290626038431875' && !message.author.bot) {
        if (!message.content.match(/^['">]/gi)) {
            let response = await message.reply({ content: `\`${message.content}\` doesn't appear to be quoting anything. Perhaps use a reaction instead?\nThis message will delete itself in 10 seconds..`});
            setTimeout(() => {
                response.delete();
                if (message && message.deletable) message.delete();
            }, 10000);
        }
    }

    if (message.channel.id == '951924418408505434') {
        // delete message after 1 minute
        setTimeout(() => { message.delete(); }, 60 * 1000);
    }
});

/** AFK Timeout (5 minutes) */
client.on('voiceStateUpdate', (pre) => {
    let connection = getVoiceConnection(pre.guild.id),
        queue = client.musicQueueManager.get(pre.guild.id)!;
    if (!queue) return;
    else if ((queue.length == 0) && connection) {
        const channelId = connection!.joinConfig.channelId,
            beforeChannelId = pre.channel?.id,
            isAlone = (!(pre.channel?.members.size) || pre.channel.members.size < 2);
        if (channelId == beforeChannelId && isAlone) {
            /** Leave channel after 5 minutes */
            queue.leaveTimeout = setTimeout(() => { connection!.destroy() }, ClientEnums.AFK_TIMEOUT_MINUTES * 60 * 1000); 
        }
    }
});

