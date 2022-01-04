import { SlashCommandBuilder } from "@discordjs/builders";
import { createEmbed } from '../../embeds/queueEmbed';
import type { Client, CommandInteraction } from "discord.js";
import { DiscordGatewayAdapterCreator } from "@discordjs/voice";
import { QueueItem } from "../utils/musicUtils";

/* TODO:
search in queue
queue controls as reactions (remove, up, down, duplicate)
*/

const slashCommand = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('View and change the music queue')
    .addSubcommand(sub =>
        sub.setName('view')
        .setDescription('View the current queue')
        .addIntegerOption(option =>
            option.setName('position')
            .setDescription('# in the queue to get information about')
            .setRequired(false)))
    .addSubcommand(sub =>
        sub.setName('remove')
        .setDescription('Removes items from the queue')
        .addIntegerOption(option =>
            option.setName('item')
            .setDescription('# in the queue to remove, if not supplied, first item will be removed')
            .setRequired(false)))
    .addSubcommand(sub =>
        sub.setName('clear')
        .setDescription('Removes all items from the queue'))
    .addSubcommand(sub =>
        sub.setName('shuffle')
        .setDescription('Shuffles the queue'));

module.exports = {
    data: slashCommand,
    category: 'Music',
    async execute(interaction: CommandInteraction) {
        const client: Client<true, any> = interaction.client;
        
        let queue = client.musicQueueManager.get(interaction.guildId);
        if (!queue || !queue.length) return interaction.reply('There are no items in the music queue.');
        switch (interaction.options.getSubcommand()) {
            case 'view':
                let position = interaction.options.getInteger('position');
                if (!position) {
                    let embed = await createEmbed(queue.items);
                    return interaction.reply({ embeds: [embed] });
                } else {
                    let index = position - 1,
                        item = queue.items[index],
                        { title, duration } = item.match,
                        requester = item.requester.displayName;

                    return interaction.reply(`#${index + 1} - **${title}** (${duration})
                    Requested by ${requester}`);
                }
            case 'remove':
                let index = interaction.options.getInteger('position');
                queue.remove(index).then(song => {
                    return interaction.reply(`Removed ${song}`);
                }).catch(err => {
                    return interaction.reply(err);
                });

            case 'clear':
                queue.clear().then(removedCount => {
                    return interaction.reply(`Cleared ${removedCount} items from the queue.`)
                }).catch(err => {
                    return interaction.reply(err);
                });      
                
            case 'shuffle':
                let temp = queue.items.shift();
                queue.shuffle();
                if (temp) queue.items.unshift(temp);
                return interaction.reply(`Shuffled ${queue.length - 1} songs`);

            default: break;
        }
    },
};

