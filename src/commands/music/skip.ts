import type { CommandInteraction } from 'discord.js';
import type { BotClient } from '../../../typings/index';
const { playQueue } = require('../utils/musicUtils');

/* TODO:
search in queue
queue controls as reactions (remove, up, down, duplicate)
*/
module.exports = {
    name: 'skip',
    category: 'General',
    description: 'Skips the currently playing song.',
    execute(interaction: CommandInteraction) {
        let client = interaction.client as BotClient;
        let { musicQueue } = client;
        let connection = client.voice?.connections.get(interaction.guild!.id);
        if (!connection || !(connection.dispatcher)) return;
        connection?.dispatcher.end();
        musicQueue.shift();
        playQueue(connection, musicQueue);
        interaction.reply('Skipped!');
    },
};