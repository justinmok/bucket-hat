import type { SlashCommandBuilder } from '@discordjs/builders';
import type { APIApplicationCommandOption } from 'discord-api-types/v9';
import { AudioPlayer, AudioResource } from '@discordjs/voice';
import type { ApplicationCommand, Collection, AudioPlayer, CommandInteraction } from 'discord.js';
import type * as ytsr from "ytsr";
import type { Logger } from 'winston';
import type { MusicQueue } from '../src/commands/utils/musicUtils';

declare module 'discord.js' {
    interface Client<T> {
        cloudProjectId?: string,
        logger: Logger
    };

    interface CommandInteraction {
        guildId: string
        channel: TextBasedChannel
    }
}

interface BotConfig {
    token: string,
    testToken: string,
}

interface embed {
    name: string,
    createEmbed(...args): MessageEmbed;
}