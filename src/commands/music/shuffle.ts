import type { CommandInteraction } from "discord.js";
import type { BotClient, MusicQueue } from "../../../typings";

// durstenfeld shuffle
const shuffle = (queue: MusicQueue): void => {
    for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
    }
};

module.exports = {
    name: 'shuffle',
    category: 'Music',
    description: 'Shuffles the music queue',
    execute(interaction: CommandInteraction) {
        let { musicQueue } = interaction.client as BotClient;
        /* keep first song */
        let temp = musicQueue.shift();
        shuffle(musicQueue);
        if (temp) musicQueue.unshift(temp);
        interaction.reply(`Shuffled ${musicQueue.length - 1} songs`);
    }
};