import type { CommandInteraction, GuildMember, VoiceConnection } from "discord.js";
import type { Result } from "ytsr";
import type { BotClient, QueueItem, VideoResult } from '../../../typings/index';
import { getTracks } from 'spotify-url-info';
import { getInfo } from 'ytdl-core';
import * as ytsr from 'ytsr';

const ytdl = require('ytdl-core-discord');
const ytRegex = /(youtu\.be|youtube\.com)/;
const spotifyRegex = /(:|\/)([A-z0-9]{22})/;

const search = (query: string, resultCount: number = 1): Promise<VideoResult[]> => {
    console.log(`Searching for ${query}`);
    return new Promise<Array<VideoResult>>(async (resolve, reject) => {
        if (query.match(ytRegex)) resolve([await parseUrl(query)]);
        ytsr.getFilters(query).then(async filters => {
            let filter = await filters.get('Type')?.get('Video');
            if (filter && filter.url) {
                let results: Result = await ytsr(filter.url, {limit: resultCount});
                resolve(<VideoResult[]>results.items);
            } else {
                reject(`Search failed.`)
            }
        })

    });
}

const getSongsFromSpotify = (spotifyUrl: string): Promise<VideoResult[]> => {
    return new Promise<VideoResult[]>(async (resolve, reject) => {
        let tracks = await getTracks(spotifyUrl);
        let results: VideoResult[] = [];
        for (const track of tracks) {
            await search(`${track.album.artists[0].name} - ${track.name}`).then(res => {
                results.push(res[0])
            });
        }
        while (results.length < tracks.length) continue; // todo :replace this with promise sometime
        resolve(results);
    });
}

const parseUrl = (query: string): Promise<VideoResult> => {
    return new Promise<VideoResult>(async (resolve, reject) => {
        let videoDetails = await (await getInfo(query)).player_response.videoDetails;
        resolve({
            type: 'video',
            title: videoDetails.title,
            id: videoDetails.videoId,
            url: `https://youtube.com/watch?v=${videoDetails.videoId}`,
            thumbnails: videoDetails.thumbnail.thumbnails,
            duration: videoDetails.lengthSeconds
        } as VideoResult)
    });
}

export const playQueue = async (connection: VoiceConnection, queue: Array<QueueItem>, volume?: number) => {
    if (queue.length == 0) return;
    let stream = await ytdl(queue[0].match.url);

    connection.play(stream, { type: 'opus' })
        .on('finish', () => {
            queue.shift();
            playQueue(connection, queue, volume);
        }).on('error', error => console.error(error));
        
    let currentVolume = connection.dispatcher!.volume;
    if (!volume) volume = currentVolume;
    connection.dispatcher?.setVolume(volume);
    console.log(`Now Playing: ${queue[0].match.title} with volume ${volume * 100}%`)
};


export const processQuery = (interaction: CommandInteraction): Promise<VideoResult[]> => {
    return new Promise<VideoResult[]>(async (resolve, reject) => {
        let { musicQueue } = interaction.client as BotClient;
        let query = interaction.options[0].value as string;
        if (query.match(spotifyRegex)) {
            getSongsFromSpotify(query).then(results => {
                musicQueue.push(...results.map(res => {
                    return {
                        match: res,
                        query,
                        requester: interaction.member as GuildMember
                    }
                }));
                resolve(results);
                
            })
        } else {
            search(query).then(result => {
                let addToQueue: QueueItem = {
                match: result[0],
                query: query,
                requester: interaction.member as GuildMember,
            }
            musicQueue.push(addToQueue);
            resolve([result[0]]);
            });
        }
    });
};