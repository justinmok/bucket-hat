import { SlashCommandBuilder } from "@discordjs/builders";
import { createEmbed } from '../../embeds/queueEmbed';
import type { CommandInteraction } from "discord.js";
import type { BotClient, MusicQueue } from "../../../typings";

/* TODO:
search in queue
queue controls as reactions (remove, up, down, duplicate)
*/
const secondsToTime = (e: number) => {
    let h = Math.floor(e / 3600).toString().padStart(2,'0'),
        m = Math.floor(e % 3600 / 60).toString().padStart(2,'0'),
        s = Math.floor(e % 60).toString().padStart(2,'0');
    return `${h}:${m}:${s}`;
}

// durstenfeld shuffle
const shuffle = (queue: MusicQueue): void => {
    for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
    }
};

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
        const { musicQueue } = interaction.client as BotClient;
        if (!musicQueue.length) return interaction.reply('There are no items in the music queue.');
        switch (interaction.options.getSubcommand()) {
            case 'view':
                if (!interaction.options.getInteger('position')) {
                    let embed = await createEmbed(musicQueue);
                    return interaction.reply({ embeds: [embed]});
                } else {
                    let item = musicQueue[interaction.options.getInteger('position')! - 1];
                    return interaction.reply(`**${item.match.title}** (${secondsToTime(parseInt(item.match.duration!))})\n
                        Requested by ${item.requester.nickname}`);
                }
            case 'remove':
                if (!interaction.options.getInteger('item')) {
                    return interaction.reply(`Removed **${musicQueue.shift()?.match.title}** from the queue.`)
                } else {
                    let index = interaction.options.getInteger('item')! - 1;
                    if (index === 0) return interaction.reply('Unable to remove the currently playing song.')
                    return interaction.reply(`Removed **${musicQueue.splice(index, 1)[0].match.title}** from the queue.`)
                }
            case 'clear':
                if (musicQueue.length > 1) return interaction.reply('Unable to remove the currently playing song.');
                let removedCount = musicQueue.splice(1);
                return interaction.reply(`Cleared ${removedCount} items from the queue.`)
            case 'shuffle':
                let temp = musicQueue.shift();
                shuffle(musicQueue);
                if (temp) musicQueue.unshift(temp);
                return interaction.reply(`Shuffled ${musicQueue.length - 1} songs`);
            default: break;
        }
    },
};