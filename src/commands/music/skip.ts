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

        audioPlayers.get(interaction.guildId!)!.player!.stop()
        musicQueue.shift();

        if (connection) playQueue(connection, musicQueue);
        else return interaction.reply('There is no active voice connection.')

        interaction.reply('Skipped!');
    },
};