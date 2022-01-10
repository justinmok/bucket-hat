import { SlashCommandBuilder } from "@discordjs/builders";
import type { Client, CommandInteraction } from "discord.js";

const slashCommand = new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resumes the music')
    
module.exports = {
    data: slashCommand,
    category: 'Music',
    execute(interaction: CommandInteraction) {
        const client: Client<true, any> = interaction.client;
        let musicQueue = client.musicQueueManager.get(interaction.guildId);
        
        if (!musicQueue || !musicQueue.length)
            return interaction.reply('There is nothing to be resumed!');
        client.audioPlayers.get(interaction.guildId)!.player.unpause();
    }
}