import type * as Discord from 'discord.js';
import type * as ytsr from "ytsr";

interface ClientWithMusic extends Discord.Client {
    musicQueue: MusicQueue;
}

interface ClientWithCommands extends Discord.Client {
    commands: Discord.Collection<string, DiscordCommand>
}

interface QueueItem {
    match: ytsr.Video,
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