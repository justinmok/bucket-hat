import { Firestore } from '@google-cloud/firestore';
import type { BotConfig } from '../typings/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import SlashCommand from './commands/Command.js';
import { logger } from './log.js';

const db = new Firestore({
    projectId: 'keylimepie',
    keyFilename: '../gcloudauth.json',
});

export const queryConfig = (): Promise<BotConfig> => {
    logger.log({
        level: 'debug',
        label: 'db',
        message: `Accessing Firestore Configuration`,
    });
    return db
        .doc('config/global')
        .get()
        .then((snap) => {
            let fetchedConfig = snap.data();
            if (fetchedConfig) {
                return {
                    openapiKey: fetchedConfig.openapiKey,
                    openapiOrg: fetchedConfig.openapiOrg,
                    token: fetchedConfig.token,
                    testToken: fetchedConfig.testToken,
                };
            } else throw new Error('Can\t get config');
        });
};

export const getCommands = async (): Promise<SlashCommand[]> => {
    const cmdsPath = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        'commands'
    );

    return fs.promises.readdir(cmdsPath).then(async (files) => {
        let cmds: SlashCommand[] = [];
        files
            .filter((file) => file.endsWith('.command.js'))
            .map(async (file) => {
                logger.log({
                    level: 'debug',
                    message: `Retrieving command file: ${file}`,
                });
                const imported = await import(`./commands/${file}`);
                const cmd: SlashCommand = imported.default;
                cmds.push(cmd);
            });
        return cmds;
    });
};

export const getCommandsBody = (cmds: SlashCommand[]) => {
    return cmds.map((cmd) => cmd.data.toJSON());
};
