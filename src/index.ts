import { Client, GatewayIntentBits, ClientOptions, PermissionsBitField, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder } from 'discord.js'

import { Collection } from 'discord.js';
import { REST } from '@discordjs/rest';
import { getVoiceConnection } from '@discordjs/voice';
import { Routes } from 'discord-api-types/v10';
import { queryConfig } from './util.js';
import * as winston from 'winston';
import { logger } from './log.js';

class ClientExtend extends Client<true, any> {
    public commands: Collection<string, SlashCommand>;
    public logger: winston.Logger;

    constructor(options: ClientOptions) {
        super(options);
        this.logger = logger;
        this.commands = new Collection();
    }
}

const rest = new REST({ version: '9' });
const client = new ClientExtend({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMembers]
    // BREAKING // intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MEMBERS']
});


enum ClientEnums {
    AFK_TIMEOUT_MINUTES = 5,
    DEV_SERVER_ID = '676293029879087104',
    TANK_SERVER_ID = '378778569465266197', /* fish tank server */
    TEST_CLIENT_ID = '464186918457049088',
    PROD_CLIENT_ID = '783886978974220338',
}


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


import ExampleCommand from './commands/test.js'
import { SlashCommand } from './commands/Command.js';

/** Load commands after client initialized */
client.once('ready', async () => {
    if (client.user)
        client.logger.log({
            level: 'info',
            label: 'main',
            message: `Succesfully logged into ${client.user.tag}`
        });

    /* const commands = await getCommands();
    client.commands = commands;

    let data: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
    for (const [k, v] of commands) {
        data.push(v.data.toJSON())
    }

    
    */
    let data: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
    
    client.commands.set(ExampleCommand.name, ExampleCommand);
    data.push(ExampleCommand.toJSON());

    if (process.env.NODE_ENV == 'dev') {
        // debugging guilds
        //await rest.put(Routes.applicationGuildCommands(ClientEnums.TEST_CLIENT_ID, ClientEnums.TANK_SERVER_ID), { body: data });
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
    const interactionCommand = interaction.command;
    const command = interaction.commandName;
    try {
        
        /* Check if command actually exists and has a function */
        if (!(client.commands.get(command)) ||
            (client.commands.get(command)?.execute == undefined)) {
                console.log(client.commands.get(command));
                throw `Command ${command} does not exist in client`;
        } else {
            client.commands.get(command)!.execute(interaction);
            client.logger.log({
                level: 'verbose',
                label: 'main',
                guild: interaction.guild,
                channel: interaction.channel,
                user: interaction.user,
                message: `Ran command ${command}`
            });
        }
    } catch (e) {
        client.logger.log({
            level: 'error',
            label: 'main',
            message: e.stack ?? e
        });
    }
});

/** Remove all commands and kill process */
client.on('messageCreate', async message => {
    const hasPermissions = message.member?.permissions.has(PermissionsBitField.Flags.Administrator);
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

/** VC AFK Timeout (5 minutes) */
client.on('voiceStateUpdate', (pre) => {
    let connection = getVoiceConnection(pre.guild.id);
    if (connection) {
        const channelId = connection!.joinConfig.channelId,
            beforeChannelId = pre.channel?.id,
            isAlone = (!(pre.channel?.members.size) || pre.channel.members.size < 2);
        if (channelId == beforeChannelId && isAlone) {
            /** Leave channel after 5 minutes */
            setTimeout(() => { connection!.destroy() }, ClientEnums.AFK_TIMEOUT_MINUTES * 60 * 1000); 
        }
    }
});

