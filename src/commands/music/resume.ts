import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../typings";

module.exports = {
    name: 'resume',
    category: 'Music',
    description: 'Resumes the music',
    execute(interaction: CommandInteraction) {
        let { musicQueue } = interaction.client as BotClient;
        if (musicQueue.length > 0)
            interaction.client.voice.connections.get(interaction.guild!.id)?.dispatcher?.resume();
    }
}