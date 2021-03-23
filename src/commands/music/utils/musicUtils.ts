import type { Message, VoiceConnection } from "discord.js";
import type { Video, Result } from "ytsr";
import type { ClientWithMusic, QueueItem } from '../../../../typings/index';

// match youtube regex
const ytdl = require('ytdl-core-discord');
//const { parseSpotify } = require('./spotifyUtils');
const ytRegex = /(youtu\.be|youtube\.com)/;

const ytsr = require('ytsr');

const search = (query: string): Promise<Array<Video>> => {
    return new Promise<Array<Video>>((resolve, reject)=> {
        ytsr.getFilters(query).then(async filters => {
            let filter = await filters.get('Type').get('Video');
            let results: Result = await ytsr(filter.url, {limit: 5});

            resolve(<Video[]>results.items);
        })

    });
}

const playQueue = async (connection: VoiceConnection, queue: Array<QueueItem>) => {
    if (queue.length == 0) return;
    let stream = await ytdl(queue[0].match.url);
    console.log('Now Playing: ', queue[0].match.title);

    connection.play(stream, { type: 'opus' })
        .on('finish', () => {
            queue.shift();
            playQueue(connection, queue);
        }).on('error', error => console.error(error));
};

const queryParser = (query: string): Promise<Array<string>> => {
    return new Promise(resolve => {
        //if (query.includes('spotify')) parseSpotify(query).then(songs => resolve(songs));
        if (!(ytRegex.test(query))) resolve([`ytsearch1: + ${query}`]);
        else resolve(new Array(query));
    });

};

const processQuery = (query: string, message: Message): Promise<Video> => {
    return new Promise<Video>((resolve, reject) => {

        // hacky fix lol
        let { musicQueue } = message.client as ClientWithMusic;
        search(query).then(results => {
            let addToQueue: QueueItem = {
                match: results[0],
                query: query,
                requester: message.member,
            }
            musicQueue.push(addToQueue);
            resolve(results[0]);
        })
    });
};

module.exports = {
    playQueue,
    processQuery
};