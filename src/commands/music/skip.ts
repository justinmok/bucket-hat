import { getVoiceConnection } from '@discordjs/voice';
import type { CommandInteraction } from 'discord.js';
import type { BotClient } from '../../../typings/index';
import { playQueue } from '../utils/musicUtils';

/* TODO:
volume adjustments
*/
module.exports = {
    name: 'skip',
    category: 'General',
    description: 'Skips the currently playing song.',
    execute(interaction: CommandInteraction) {
        let { musicQueue, audioPlayers } = interaction.client as BotClient;
        let connection = getVoiceConnection(interaction.guildId!);

        if (musicQueue.length == 0) return interaction.reply('There is nothing to be skipped.');

        console.log(`Skipping: ${musicQueue[0].match.title}. 
            ${(musicQueue[1]) ? 'Next song: ' + musicQueue[1].match.title : ''}`)
        audioPlayers.get(interaction.guildId!)!.player!.stop(true)
        musicQueue.shift();

        if (connection) playQueue(connection, musicQueue);
        interaction.reply('Skipped!');
    },
};