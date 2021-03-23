import { Message } from "discord.js";
import { ClientWithMusic, MusicQueue } from "../../../typings";

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
    description: 'shuffles bot',
    usage: '',
    execute(message: Message, args: string[]) {
        let { musicQueue } = message.client as ClientWithMusic;
        /* keep first song */
        let temp = musicQueue.shift();
        shuffle(musicQueue);
        if (temp) musicQueue.unshift(temp);
        message.reply(`Shuffled ${musicQueue.length - 1} songs`);
    }
};