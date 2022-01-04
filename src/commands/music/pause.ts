import { SlashCommandBuilder } from "@discordjs/builders";
import type { Client, CommandInteraction } from "discord.js";

const slashCommand = new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pauses the music')

module.exports = {
    data: slashCommand,
    category: 'Music',
    execute(interaction: CommandInteraction) {
        const client: Client<true, any> = interaction.client;
        let musicQueue = client.musicQueueManager.get(interaction.guildId);
        
        if (!musicQueue || musicQueue.length)
            client.audioPlayers.get(interaction.guildId!)!.player.pause();
    }
}