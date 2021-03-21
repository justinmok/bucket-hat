// durstenfeld shuffle
const shuffle = queue => {
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
    execute(message, args) {
        let { musicQueue } = message.client;

        /* keep first song */
        let temp = musicQueue.shift();
        shuffle(musicQueue);
        musicQueue.unshift(temp);
        message.reply(`Shuffled ${musicQueue.length - 1}songs`);
    }
};