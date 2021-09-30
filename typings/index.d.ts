import type { SlashCommandBuilder } from '@discordjs/builders';
import type { APIApplicationCommandOption } from 'discord-api-types/v9';
import type { AudioPlayer, AudioResource } from '@discordjs/voice';
import type * as Discord from 'discord.js';
import type * as ytsr from "ytsr";
interface BotClient extends Discord.Client {
    commands: Map<string, DiscordCommand>,
    audioPlayers: Map<string, AudioPlayerWithResource>
    musicQueue: MusicQueue,
    cloudProjectId?: string,
    channelTimeout: NodeJS.Timeout | null;
}

interface AudioPlayerWithResource {
    player: AudioPlayer,
    resource: AudioResource
}
interface BotConfig {
    token: string,
    testToken: string,
}

interface VideoResult extends Omit<ytsr.Video, 'bestThumbnail' | 'author' | 'isUpcoming' | 'views' |'isLive' | 'badges' | 'isComing' | 'upcoming' | 'uploadedAt' | 'description'> {
    
}

interface QueueItem {
    match: VideoResult,
    query: string,
    requester: Discord.GuildMember
}

type MusicQueue = Array<QueueItem>;

interface embed {
    name: string,
    createEmbed(...args): Discord.MessageEmbed;
}

interface SlashCommandDataJSON {
    name: string;
    description: string;
    options: APIApplicationCommandOption[];
    default_permission: boolean | undefined;
}
interface DiscordCommand extends Discord.ApplicationCommand {
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

type BotCommands = Discord.Collection<string, DiscordCommand>;

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

interface cryptoInfo extends geminiResponse{
    exchange: string,
    fiat: string,
    ticker: string,
}
