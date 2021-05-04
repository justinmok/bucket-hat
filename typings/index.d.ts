import type * as Discord from 'discord.js';
import type * as ytsr from "ytsr";

interface BotClient extends Discord.Client {
    defaultPrefix: string,
    commands: Map<string, DiscordCommand>,
    musicQueue: MusicQueue,
    prefixes: Discord.Collection<string, string>,
    cloudProjectId?: string,
}

interface BotConfig {
    defaultPrefix: string,
    token: string,
    testToken: string,
}

interface VideoResult extends Omit<ytsr.Video, 'bestThumbnail' | 'author' | 'isUpcoming' | 'views' |'isLive' | 'badges' | 'isComing' | 'upcoming' | 'uploadedAt' | 'description'> {
    
}

interface QueueItem {
    match: VideoResult,
    query: string,
    requester: Discord.GuildMember | null
}

type MusicQueue = Array<QueueItem>;

interface embed {
    name: string,
    createEmbed(...args): Discord.MessageEmbed;
}

interface DiscordCommand {
    name: string,
    category: 'Admin' | 'General' | 'Music' | 'Experimental',
    usage: string,
    description: string,
    execute(...args): any
}

type BotCommands = Discord.Collection<string, DiscordCommand>;

interface cryptoInfo {
    price: number,
    price_base: string,
    ticker: string,
    exchange: string,
    time: number
}