import {
    Client,
    ClientOptions,
    Collection,
    GatewayIntentBits,
    REST,
} from 'discord.js';
import { Routes } from 'discord-api-types/v10';

import SlashCommand from './commands/Command.js';
import * as winston from 'winston';
import { logger } from './log.js';
import { getCommands, getCommandsBody, config } from './util.js';

const rest = new REST({ version: '9' });

enum ClientEnums {
    AFK_TIMEOUT_MINUTES = 5,
    DEV_SERVER_ID = '676293029879087104',
    TANK_SERVER_ID = '378778569465266197' /* fish tank server */,
    TEST_CLIENT_ID = '464186918457049088',
    PROD_CLIENT_ID = '783886978974220338',
}

class ClientExtend extends Client<true, any> {
    public commands: Collection<string, SlashCommand>;
    public logger: winston.Logger;

    constructor(options: ClientOptions) {
        super(options);
        this.logger = logger;
        this.commands = new Collection();
    }
}

export const client = new ClientExtend({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
});

/* get config, login client with token */
export const initClient = async () => {
    getCommands()
        .then((cmds) => {
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
                error: e,
            });
            process.exit(-1);
        });
};

/* PUT cmds to app after client ready */
export const clientReadyHandler = async () => {
    const commands = Array.from(client.commands.values());
    let data = getCommandsBody(commands);

    if (client.user) {
        client.logger.log({
            level: 'info',
            label: 'main',
            message: `Succesfully logged into ${client.user.tag}`,
        });

        if (process.env.NODE_ENV == 'dev')
            await rest.put(
                Routes.applicationGuildCommands(
                    ClientEnums.TEST_CLIENT_ID,
                    ClientEnums.DEV_SERVER_ID
                ),
                { body: data }
            );
    }

    await client.application?.commands.fetch();
    client.logger.log({
        level: 'info',
        label: 'main',
        message: `Loaded ${client.application?.commands.cache.size} commands.`,
    });
};
