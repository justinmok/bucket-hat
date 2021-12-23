import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";

const slashCommand = new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pauses the music')

module.exports = {
    data: slashCommand,
    category: 'Music',
    execute(interaction: CommandInteraction) {
        let { musicQueue, audioPlayers } = interaction.client;
        if (musicQueue.length) audioPlayers.get(interaction.guildId!)!.player.pause();
    }
}