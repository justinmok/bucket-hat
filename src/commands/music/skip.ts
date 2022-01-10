import { SlashCommandBuilder } from '@discordjs/builders';
import { getVoiceConnection } from '@discordjs/voice';
import type { Client, CommandInteraction } from 'discord.js';
import { getVolume } from '../../util';
import { playQueue } from '../utils/musicUtils';

const slashCommand = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skips the currently playing song')

module.exports = {
    data: slashCommand,
    category: 'General',

    async execute(interaction: CommandInteraction) {
        const client: Client<true, any> = interaction.client;
        let musicQueue = client.musicQueueManager.get(interaction.guildId);
        let connection = getVoiceConnection(interaction.guildId!);

        if (!musicQueue || !musicQueue.length) return interaction.reply('There is nothing to be skipped.');
        let title = musicQueue.items[0].match.title;
        let nextSong = musicQueue.items[1].match.title ?? '';
        client.logger.log({
            level: 'info',
            label: 'main',
            message: `Skipping: ${title}${(nextSong.length) ? '\nNext song: ' + nextSong : ''}`
        });
        
        client.audioPlayers.get(interaction.guildId!)!.player!.stop(true)
        musicQueue.items.shift();

        if (connection && musicQueue) {
            let volume = await getVolume(interaction.guildId)
            playQueue(connection, musicQueue, volume);
        }
        interaction.reply('Skipped!');
    },
};