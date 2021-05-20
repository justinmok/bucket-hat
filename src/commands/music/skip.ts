import type { CommandInteraction } from 'discord.js';
import type { BotClient } from '../../../typings/index';
import { playQueue } from '../utils/musicUtils';

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
        let volume = connection.dispatcher.volume;
        connection?.dispatcher.end();
        musicQueue.shift();
        playQueue(connection, musicQueue, volume);
        interaction.reply('Skipped!');
    },
};