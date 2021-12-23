import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";

const slashCommand = new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resumes the music')
    
module.exports = {
    data: slashCommand,
    category: 'Music',
    execute(interaction: CommandInteraction) {
        let { musicQueue, audioPlayers } = interaction.client;
        if (musicQueue.length == 0) return interaction.reply('There is nothing to be resumed!');

        audioPlayers.get(interaction.guildId!)!.player!.unpause();
    }
}