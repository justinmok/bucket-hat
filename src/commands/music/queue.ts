import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../typings";
import { createEmbed } from '../../embeds/queueEmbed';

/* TODO:
search in queue
queue controls as reactions (remove, up, down, duplicate)
*/
module.exports = {
    name: 'queue',
    category: 'Music',
    description: 'Sends a list of commands',
    options: [{
        type: 'INTEGER',
        name: 'position',
        description: '# in the queue to get information about',
        required: false
    }],
    async execute(interaction: CommandInteraction) {
        const { musicQueue } = interaction.client as BotClient;
        if (!musicQueue.length) return interaction.reply('There are no items in the music queue.');
        if (!interaction.options.data.length) {
            let embed = await createEmbed(musicQueue);
            interaction.reply({ embeds: [embed]});
        } 
    },
};