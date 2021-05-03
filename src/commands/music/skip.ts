import type { BotClient } from '../../../typings/index';
const { playQueue } = require('./utils/musicUtils');

/* TODO:
search in queue
queue controls as reactions (remove, up, down, duplicate)
*/
module.exports = {
    name: 'skip',
    category: 'General',
    description: 'skips currently playing song',
    usage: 'skip',

    execute(message) {
        let client = message.client as BotClient;
        let { musicQueue } = client;
        let connection = client.voice?.connections.get(message.guild.id);
        if (!connection || !(connection.dispatcher)) return;
        connection?.dispatcher.end();
        musicQueue.shift();
        playQueue(connection, musicQueue);
    },
};