import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../typings";

module.exports = {
    name: 'clearqueue',
    category: 'Music',
    description: 'Clears the music queue',
    options: [{
        type: 'INTEGER',
        name: 'items',
        description: '# of items in the queue to remove',
        required: false
    }],
    execute(interaction: CommandInteraction) {
        const { musicQueue } = interaction.client as BotClient;
        if (!musicQueue.length) return interaction.reply('There are no items in the music queue.');
        if (!interaction.options.length) {
            musicQueue.splice(1)
            interaction.reply('Cleared the queue');
        }
    },
};