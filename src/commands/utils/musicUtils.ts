import { getTracks } from 'spotify-url-info';
import { getInfo } from 'ytdl-core';
import ytsr = require('ytsr');
import { Readable } from "stream";
import { logger } from '../../log';

import { VoiceConnection, createAudioPlayer, NoSubscriberBehavior, createAudioResource, AudioPlayerStatus } from "@discordjs/voice"
import type { AudioPlayerWithResource, QueueItem, VideoResult } from '../../../typings/index';
import type { CommandInteraction, GuildMember } from "discord.js";

const ytdl = require('ytdl-core-discord');
const ytRegex = /(youtu\.be|youtube\.com)/;
const spotifyRegex = /(:|\/)([A-z0-9]{22})/;

const search = (query: string, resultCount: number = 1): Promise<VideoResult[]> => {
    return new Promise<Array<VideoResult>>(async (resolve, reject) => {
        if (query.match(ytRegex)) resolve([await parseUrl(query)]);
        ytsr.getFilters(query).then(async filters => {
            let filter = await filters.get('Type')?.get('Video');
            if (filter && filter.url) {
                let results: ytsr.Result = await ytsr(filter.url, { limit: resultCount });
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

export const playQueue = async (connection: VoiceConnection, queue: Array<QueueItem>, volume?: number): Promise<AudioPlayerWithResource> => {
    return new Promise<AudioPlayerWithResource>(async (resolve, reject) => {
        if (queue.length == 0) return;
        let stream: Readable = await ytdl(queue[0].match.url, { highWaterMark: 1 << 25 });

        stream.on('unpipe', (e) => {
            reject(`ytdl error: unpiped\n ${e}`)
        })
        
        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });

        let resource = createAudioResource(stream, { inlineVolume: true });
        let currentVolume = resource.volume!.volume;
        if (!volume) volume = currentVolume;
        resource.volume!.setVolume(volume);

        player.play(resource);
        resolve({ player, resource });
        
        logger.log({
            level: 'info',
            label: 'main',
            message: `Now Playing: ${queue[0].match.title} with volume ${volume * 100}%`
        });

        const subscription = connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {
            queue.shift();
            subscription?.unsubscribe();
            playQueue(connection, queue, volume);
        }).on('error', err => reject(err));
    });

};

export const processQuery = (interaction: CommandInteraction): Promise<VideoResult[]> => {
    return new Promise<VideoResult[]>(async (resolve, reject) => {
        let { musicQueue } = interaction.client;
        let query = interaction.options.getString('query')!;
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