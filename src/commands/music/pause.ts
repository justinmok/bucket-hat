import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../typings";

module.exports = {
    name: 'pause',
    category: 'Music',
    description: 'Pauses the music',
    execute(interaction: CommandInteraction) {
        let client = interaction.client as BotClient;
        if (client.musicQueue.length) {
            interaction.reply('⏸️ Paused')
            client.voice.connections.get(interaction.guild!.id)?.dispatcher?.pause();
        } else {
            interaction.reply('There is no music playing.')
        }

    }
}