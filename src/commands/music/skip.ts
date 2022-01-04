import { SlashCommandBuilder } from '@discordjs/builders';
import { getVoiceConnection } from '@discordjs/voice';
import type { Client, CommandInteraction } from 'discord.js';
import { playQueue } from '../utils/musicUtils';

const slashCommand = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skips the currently playing song')

module.exports = {
    data: slashCommand,
    category: 'General',

    execute(interaction: CommandInteraction) {
        const client: Client<true, any> = interaction.client;
        let musicQueue = client.musicQueueManager.get(interaction.guildId);
        let connection = getVoiceConnection(interaction.guildId!);

        if (!musicQueue || !musicQueue.length) return interaction.reply('There is nothing to be skipped.');

        client.logger.log({
            level: 'info',
            label: 'main',
            message: `Skipping: ${musicQueue.items[0].match.title}.
            ${(musicQueue.items[1]) ? 'Next song: ' + musicQueue.items[1].match.title : ''}`
        });
        
        client.audioPlayers.get(interaction.guildId!)!.player!.stop(true)
        musicQueue.items.shift();

        if (connection) playQueue(connection, musicQueue);
        interaction.reply('Skipped!');
    },
};