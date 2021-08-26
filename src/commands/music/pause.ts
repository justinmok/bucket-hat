import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../typings";

module.exports = {
    name: 'pause',
    category: 'Music',
    description: 'Pauses the music',
    execute(interaction: CommandInteraction) {
        let { audioPlayers } = interaction.client as BotClient;
        audioPlayers.get(interaction.guildId!)?.pause();
    }
}