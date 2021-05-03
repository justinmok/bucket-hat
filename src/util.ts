import { Firestore } from '@google-cloud/firestore';
import * as fs from 'fs';

import type { BotConfig, DiscordCommand } from '../typings/index';

type prefixMap = Map<string, string>;

const db = new Firestore({
    projectId: 'keylimepie',
    keyFilename: '../gcloudauth.json'
});

const serverConfigs = db.doc('config/by_server').collection('server');

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

export const queryPrefixes = (): Promise<prefixMap> => {
    return new Promise<prefixMap>((resolve, reject) => {
        let map = new Map();
        serverConfigs.get().then(snapshot => {
            snapshot.forEach(server => {
                map.set(server.id, server.data().prefix);
            })
            resolve(map);
        })
        .catch(e => {
            throw e;
        })
    });
}

export const getVolume = (serverId): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
        serverConfigs.doc(serverId).get().then(config => {
            if (!(config.data())) reject('vol_not_set');
            resolve(config.data()!.volume);
        })
    });
}

export const updatePrefix = (serverId: string, prefix: string) => {
    serverConfigs.doc(serverId).update({'prefix': prefix}).catch(e => { throw e });
}

export const updateVolume = (serverId: string, volume: number) => {
    serverConfigs.doc(serverId).update({'volume': volume}).catch(e => { throw e });
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