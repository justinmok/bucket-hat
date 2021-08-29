import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../typings";

module.exports = {
    name: 'pause',
    category: 'Music',
    description: 'Pauses the music',
    execute(interaction: CommandInteraction) {
        let { musicQueue, audioPlayers } = interaction.client as BotClient;
        if (musicQueue.length) audioPlayers.get(interaction.guildId!)!.player.pause();
    }
}