import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../typings";

const slashCommand = new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resumes the music')
    
module.exports = {
    data: slashCommand,
    category: 'Music',
    execute(interaction: CommandInteraction) {
        let { musicQueue, audioPlayers } = interaction.client as BotClient;
        if (musicQueue.length == 0) return interaction.reply('There is nothing to be resumed!');

        audioPlayers.get(interaction.guildId!)!.player!.unpause();
    }
}