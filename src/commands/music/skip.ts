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
        const { musicQueue } = message.client;
        if (!message.client.voice.connections) return;
        if (musicQueue.length == 0) return;
        let connection = message.client.voice.connections.entries().next().value[1];
        connection.dispatcher.end();
        musicQueue.shift();
        playQueue(connection, musicQueue);
    },
};