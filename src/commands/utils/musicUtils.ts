import { AudioPlayerStatus, createAudioPlayer, createAudioResource, NoSubscriberBehavior, VoiceConnection } from "@discordjs/voice";
import { Client, CommandInteraction, GuildMember } from "discord.js";
import { getTracks } from 'spotify-url-info';
import { Readable } from "stream";
import { getInfo } from 'ytdl-core';
import type { AudioPlayerWithResource, VideoResult } from '../../../typings/index';
import { logger } from '../../log';
import ytsr = require('ytsr');
import { hrtime } from "process";

const ytdl = require('ytdl-core-discord');
const ytRegex = /(youtu\.be|youtube\.com)/;
const spotifyRegex = /(:|\/)([A-z0-9]{22})/;

export class QueueItem {
    public match: VideoResult;
    public query: string;
    public requester: GuildMember;

    constructor(match: VideoResult, query: string, requester: GuildMember) {
        this.match = match;
        this.query = query;
        this.requester = requester;
    }


}

export class MusicQueue {
    public guildId: string;
    public items = Array<QueueItem>();
    public leaveTimeout: NodeJS.Timer;

    constructor(guildId: string, items?: Array<QueueItem>) {
        (items) ? this.items = items : this.items = [];
        this.guildId = guildId;
    }

    public add(items: QueueItem[]) {
        this.items.push(...items);
    }

    public remove(index: number | null): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            /** remove the last item if an index is not provided */
            if (!index) resolve(this.items.pop()!.match.title);
            else {
                /** if the index given is 0 */
                if (index === 0) reject('Unable to remove the currently playing song.')
                else resolve(this.items.splice(index, 1)[0].match.title);
            }
        })
    }

    public clear(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            if (this.items.length == 1) reject('Unable to remove the only playing song')
            else resolve(this.items.splice(1).length);
        });
    }

    public shuffle() {
        for (let i = this.items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
        }
    }

    get length() {
        return this.items.length;
    }
}

const search = (query: string, resultCount: number = 1): Promise<VideoResult[]> => {
    return new Promise<Array<VideoResult>>(async (resolve, reject) => {
        if (query.match(ytRegex)) resolve([await parseUrl(query)]);
        let filters = await ytsr.getFilters(query)
        let filter = await filters.get('Type')?.get('Video');
        if (filter && filter.url) {
            let results: ytsr.Result = await ytsr(filter.url, { limit: resultCount });
            resolve(<VideoResult[]>results.items);
        } else {
            reject(`Search failed.`);
        }

    });
}

const getSongsFromSpotify = (spotifyUrl: string, maxCount?: number): Promise<VideoResult[]> => {
    return new Promise<VideoResult[]>(async (resolve) => {
        let tracks = await (await getTracks(spotifyUrl)).slice(0, maxCount);
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
    return new Promise<VideoResult>(async (resolve) => {
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

export const playQueue = async (connection: VoiceConnection, queue: MusicQueue, volume?: number): Promise<AudioPlayerWithResource> => {
    return new Promise<AudioPlayerWithResource>(async (resolve, reject) => {
        if (queue.length == 0 || !queue.items[0]) return;
        let stream: Readable = await ytdl(queue.items[0].match.url, { highWaterMark: 1 << 25 });

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
            label: 'music',
            message: `Now Playing: ${queue.items[0].match.title} with volume ${volume * 100}%`
        });

        const subscription = connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {
            queue.items.shift();
            subscription?.unsubscribe();
            playQueue(connection, queue, volume);
        }).on('error', err => reject(err));
    });

};

export const processQuery = (interaction: CommandInteraction): Promise<VideoResult[]> => {
    return new Promise<VideoResult[]>(async (resolve, reject) => {
        if (!interaction.inCachedGuild()) return;
        const client: Client<true, any> = interaction.client;
        let start = hrtime.bigint();
        let queue = client.musicQueueManager.get(interaction.guildId)!;
        let query = interaction.options.getString('query')!;

        if (process.env.NODE_ENV == 'dev') query = 'https://open.spotify.com/playlist/2skBZ0c1zNCnIM3ugbGLkn?si=56f0f3dad7904172';

        if (query.match(spotifyRegex)) {
            /** get the first song then load others */
            getSongsFromSpotify(query, 1).then(results => {
                client.logger.log({
                    level: 'debug',
                    label: 'music',
                    message: `First song took ${(hrtime.bigint() - start) / BigInt(600000)}ms`
                })
                queue.add(results.map(res => {
                    return new QueueItem(
                        res,
                        query,
                        interaction.member,
                    );
                }));
                resolve(results);
            }).then(() => {
                getSongsFromSpotify(query).then(results => {
                    results.slice(1).forEach((result) => {
                        queue.add([new QueueItem(result, query, interaction.member)]);
                    });
                });
            });

        } else {
            search(query).then(result => {
                if (!result[0]) return reject('no_songs');
                let addToQueue = new QueueItem(result[0], query, interaction.member);
                queue.add([addToQueue]);
                resolve([result[0]]);
            });
        }
    });
};