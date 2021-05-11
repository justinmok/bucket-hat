import type { BotClient, VideoResult } from "../../../typings";
import { getVolume } from "../../util";

const { playQueue, processQuery } = require('../utils/musicUtils');

module.exports = {
    name: 'play',
    category: 'Music',
    description: 'Plays a youtube video in the vc lol',
    usage: '[youtube link]',
    playQueue,
    execute(message, args: string[]) {
        if (!args.length) return;
        let user = message.member;
        let voice = user!.voice;
        let { musicQueue } = message.client as BotClient;
        let isPlaying = musicQueue.length != 0;

        if (!voice.channel)
            return message.channel.send('Join a voice channel to use this command.');

        let query = args.join(' ');
        
        voice.channel.join().then((connection) => {
            processQuery(query, message).then(async (info: VideoResult) => {
                if (!isPlaying) {
                    let volume = await getVolume(message.guild.id);
                    playQueue(connection, musicQueue, volume);
                    message.channel.send(`Now playing ${info.title} in ${voice.channel.name}`);
                }
                else message.channel.send(`Added ${info.title} to the queue.`);
            }).catch(err => console.log(err));

            clearTimeout(message.client.channelTimeout);
        });
    },
};
