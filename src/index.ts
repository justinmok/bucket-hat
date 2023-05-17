import {
    Client,
    GatewayIntentBits,
    ClientOptions,
    Collection,
    PermissionsBitField,
} from 'discord.js';

import { REST } from '@discordjs/rest';
import { getVoiceConnection } from '@discordjs/voice';
import { Routes } from 'discord-api-types/v10';
import { getCommands, getCommandsBody, queryConfig } from './util.js';
import * as winston from 'winston';
import { logger } from './log.js';
import type SlashCommand from './commands/Command.js';
import { interactionHandler } from './events/Events.js';

class ClientExtend extends Client<true, any> {
    public commands: Collection<string, SlashCommand>;
    public logger: winston.Logger;

    constructor(options: ClientOptions) {
        super(options);
        this.logger = logger;
        this.commands = new Collection();
    }
}

// todo: initialize client with other options
const rest = new REST({ version: '9' });
const client = new ClientExtend({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
});

enum ClientEnums {
    AFK_TIMEOUT_MINUTES = 5,
    DEV_SERVER_ID = '676293029879087104',
    TANK_SERVER_ID = '378778569465266197' /* fish tank server */,
    TEST_CLIENT_ID = '464186918457049088',
    PROD_CLIENT_ID = '783886978974220338',
}

Promise.all([queryConfig(), getCommands()])
    .then((values) => {
        const config = values[0];
        const cmds = values[1];

        let token = config.token;
        if (process.env.NODE_ENV == 'dev') token = config.testToken;
        client.logger.log({
            level: 'info',
            label: 'main',
            message: `Logging in with token ***********${token.slice(-8)}`,
        });

        cmds.forEach((cmd) => client.commands.set(cmd.data.name, cmd));

        rest.setToken(token);
        client.login(token);
    })
    .catch((e) => {
        // fatal
        client.logger.log({
            level: 'crit',
            label: 'main',
            message: 'Unexpected error during startup. Exiting.',
        });
        process.exit(-1);
    });

/** Load commands after client initialized */
client.once('ready', async () => {
    const commands = Array.from(client.commands.values());
    let data = getCommandsBody(commands);

    if (client.user) {
        client.logger.log({
            level: 'info',
            label: 'main',
            message: `Succesfully logged into ${client.user.tag}`,
        });

        if (process.env.NODE_ENV == 'dev') {
            await rest.put(
                Routes.applicationGuildCommands(
                    ClientEnums.TEST_CLIENT_ID,
                    ClientEnums.DEV_SERVER_ID
                ),
                { body: data }
            );
        } else {
            await rest.put(
                Routes.applicationCommands(ClientEnums.PROD_CLIENT_ID),
                { body: data }
            );
        }
    }

    await client.application?.commands.fetch();
    client.logger.log({
        level: 'info',
        label: 'main',
        message: `Loaded ${client.application?.commands.cache.size} commands.`,
    });
});

/** Main command handler */
client.on('interactionCreate', interactionHandler);

/** Remove all commands and kill process */
client.on('messageCreate', async (message) => {
    const hasPermissions = message.member?.permissions.has(
        PermissionsBitField.Flags.Administrator
    );
    if (!hasPermissions || !message.content.startsWith('.refresh')) return;
    client.logger.log({
        level: 'info',
        label: 'main',
        message: `Application command refresh called by ${message.author.username}!`,
    });

    rest.put(Routes.applicationCommands(ClientEnums.PROD_CLIENT_ID), {
        body: [],
    })
        .then(() => {
            client.logger.log({
                level: 'info',
                label: 'main',
                message: `Application commands removed!`,
            });
        })
        .catch(logger.error)
        .finally(() => process.exit(-1));
});

/** VC AFK Timeout (5 minutes) */
client.on('voiceStateUpdate', (pre) => {
    let connection = getVoiceConnection(pre.guild.id);
    if (connection) {
        const channelId = connection!.joinConfig.channelId,
            beforeChannelId = pre.channel?.id,
            isAlone =
                !pre.channel?.members.size || pre.channel.members.size < 2;
        if (channelId == beforeChannelId && isAlone) {
            /** Leave channel after 5 minutes */
            setTimeout(() => {
                connection!.destroy();
            }, ClientEnums.AFK_TIMEOUT_MINUTES * 60 * 1000);
        }
    }
});
