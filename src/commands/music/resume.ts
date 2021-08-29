import { getVoiceConnection } from "@discordjs/voice";
import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../typings";

module.exports = {
    name: 'resume',
    category: 'Music',
    description: 'Resumes the music',
    execute(interaction: CommandInteraction) {
        let { musicQueue, audioPlayers } = interaction.client as BotClient;
        if (musicQueue.length == 0) return interaction.reply('There is nothing to be resumed!');

        audioPlayers.get(interaction.guildId!)!.player!.unpause();
    }
}