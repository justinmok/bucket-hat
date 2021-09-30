import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../typings";

const slashCommand = new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pauses the music')

module.exports = {
    data: slashCommand,
    category: 'Music',
    execute(interaction: CommandInteraction) {
        let { musicQueue, audioPlayers } = interaction.client as BotClient;
        if (musicQueue.length) audioPlayers.get(interaction.guildId!)!.player.pause();
    }
}