import { SlashCommandBuilder } from '@discordjs/builders';
import type { Client, CommandInteraction } from 'discord.js';
import { updateVolume } from '../../util';

const slashCommand = new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Changes the volume of the audio')
    .addIntegerOption(option =>
        option.setName('percent')
            .setDescription('A number from 0-200')
            .setRequired(true));
module.exports = {
    data: slashCommand,
    category: 'Music',
    execute(interaction: CommandInteraction) {
        const client: Client<true, any> = interaction.client;
        let musicQueue = client.musicQueueManager.get(interaction.guildId);
        let guild = interaction.guild!.id!;
        let volume = interaction.options.getInteger('percent')! / 100;
        
        updateVolume(guild, volume);
        if (musicQueue || musicQueue!.length) client.audioPlayers.get(interaction.guildId!)!.resource.volume!.setVolume(volume);
        interaction.reply(`Set the volume to ${volume * 100}%.`);
    },
};