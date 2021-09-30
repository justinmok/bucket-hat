import { SlashCommandBuilder } from '@discordjs/builders';
import { getVoiceConnection } from '@discordjs/voice';
import type { CommandInteraction } from 'discord.js';
import type { BotClient } from '../../../typings/index';
import { playQueue } from '../utils/musicUtils';

const slashCommand = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skips the currently playing song')

module.exports = {
    data: slashCommand,
    category: 'General',

    execute(interaction: CommandInteraction) {
        let { musicQueue, audioPlayers } = interaction.client as BotClient;
        let connection = getVoiceConnection(interaction.guildId!);

        if (!musicQueue.length) return interaction.reply('There is nothing to be skipped.');

        console.log(`Skipping: ${musicQueue[0].match.title}. 
            ${(musicQueue[1]) ? 'Next song: ' + musicQueue[1].match.title : ''}`)
        audioPlayers.get(interaction.guildId!)!.player!.stop(true)
        musicQueue.shift();

        if (connection) playQueue(connection, musicQueue);
        interaction.reply('Skipped!');
    },
};