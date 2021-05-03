import { Firestore } from '@google-cloud/firestore';
import * as fs from 'fs';

import type { BotConfig, DiscordCommand } from '../typings/index';

interface prefix {
    serverId: string,
    prefix: string,
}

const db = new Firestore({
    projectId: 'keylimepie',
    keyFilename: '../gcloudauth.json'
});

export const queryConfig = (): Promise<BotConfig> => {
    return new Promise<BotConfig>((resolve, reject) => {
        db.doc('config/global').get().then((ret) => {
            let fetchedConfig = ret.data();
            if (!fetchedConfig) reject('Can\'t get config');
            resolve({
                token: fetchedConfig?.token,
                testToken: fetchedConfig?.testToken,
                defaultPrefix: fetchedConfig?.defaultPrefix
            });
        });
    });
}

export const queryPrefixes = (): Promise<Map<string, string>> => {
    return new Promise<Map<string, string>>((resolve, reject) => {
        let map = new Map();
        db.doc('config/prefixes').get().then((query) => {
            let prefixes = query.data();
            for (var i in prefixes) map.set(i, prefixes[i]);  
            resolve(map);  
        });
    });
}

export const getCommands = (): Promise<Map<string, DiscordCommand>> => {
    let commandsCollection = new Map();
    return new Promise<Map<string, DiscordCommand>>((resolve, reject) => {
        let commandsFolder = fs.readdirSync('./commands').filter(dir => !dir.includes('utils'));
        for (const folder of commandsFolder) {
            const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(`./commands/${folder}/${file}`);
                commandsCollection.set(command.name, command);
            }
        }
        resolve(commandsCollection);
    });
}