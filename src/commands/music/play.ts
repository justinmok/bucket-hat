import type { Video } from "ytsr";

const { playQueue, processQuery } = require('./utils/musicUtils');

module.exports = {
    name: 'play',
    category: 'Music',
    description: 'Plays a youtube video in the vc lol',
    usage: '[youtube link]',
    playQueue,
    execute(message, args) {
        if (!args.length) return;
        let user = message.member;
        let voice = user.voice;
        let { musicQueue } = message.client;
        let isPlaying = musicQueue.length != 0;

        if (!voice.channel)
            return message.channel.send('Join a voice channel to use this command.');

        let query = args.join(' ');

        voice.channel.join().then((connection) => {
            processQuery(query, message).then((info: Video) => {
                if (!isPlaying) {
                    message.channel.send(`Now playing ${info.title} in ${voice.channel.name}`);
                    playQueue(connection, musicQueue);
                }
                else message.channel.send(`Added ${info.title} to the queue.`);
            }).catch(err => console.log(err));
        });
    },
};
