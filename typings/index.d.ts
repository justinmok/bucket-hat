import type { SlashCommandBuilder } from '@discordjs/builders';
import type { APIApplicationCommandOption } from 'discord-api-types/v9';
import { AudioPlayer, AudioResource } from '@discordjs/voice';
import type { ApplicationCommand, Collection, AudioPlayer } from 'discord.js';
import type * as ytsr from "ytsr";
import type { Logger } from 'winston';
import type { MusicQueue } from '../src/commands/utils/musicUtils';

declare module 'discord.js' {
    interface Client<T> {
        commands: Map<string, DiscordCommand>,
        audioPlayers: Map<string, AudioPlayerWithResource>
        musicQueueManager: Collection<string, MusicQueue>,
        cloudProjectId?: string,
        logger: Logger
    };
}

interface AudioPlayerWithResource {
    player: AudioPlayer
    resource: AudioResource
}
interface BotConfig {
    token: string,
    testToken: string,
}

type VideoResult = Omit<ytsr.Video, 'bestThumbnail' | 'author' | 'isUpcoming' | 'views' |'isLive' | 'badges' | 'isComing' | 'upcoming' | 'uploadedAt' | 'description'> 

interface embed {
    name: string,
    createEmbed(...args): MessageEmbed;
}

interface SlashCommandDataJSON {
    name: string;
    description: string;
    options: APIApplicationCommandOption[];
    default_permission: boolean | undefined;
}
interface DiscordCommand extends ApplicationCommand {
    data: SlashCommandBuilder
    toJSON(): SlashCommandDataJSON
    category: 'Admin' | 'General' | 'Music' | 'Experimental',
    execute(...args): any
}

interface MinecraftResponse {
    description: {
        text: string
    },
    players: {
        max: number,
        online: number,
        sample: [ name: string, id: string ]
    }
    version: {
        name: string,
        protocol: number,
    }
    favicon?: string,
    ping: number,
}

type BotCommands = Collection<string, DiscordCommand>;

interface geminiResponse {
    symbol: string,
    open: string,
    high: string,
    low: string,
    close: string,
    changes: string[],
    bid: string,
    ask: string,
}

interface cryptoInfo extends geminiResponse {
    exchange: string,
    fiat: string,
    ticker: string,
}
