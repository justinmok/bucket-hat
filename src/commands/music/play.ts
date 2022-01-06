import type { Client, CommandInteraction, GuildMember } from "discord.js";
import type { VideoResult } from "../../../typings";
import { getVolume } from "../../util";

import { DiscordGatewayAdapterCreator, getVoiceConnection, joinVoiceChannel } from '@discordjs/voice'
import { MusicQueue, playQueue, processQuery } from '../utils/musicUtils'
import { SlashCommandBuilder } from "@discordjs/builders";

const slashCommand = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Joins your voice channel and plays music idk')
    .addStringOption(option => 
        option.setName('query')
        .setDescription('A valid Youtube or Spotify link (yt playlists not accepted atm)')
        .setRequired(true))
module.exports = {
    data: slashCommand,
    category: 'Music',
    playQueue,
    execute(interaction: CommandInteraction) {
        const client: Client<true, any> = interaction.client;
        let user = interaction.member as GuildMember,
            userVoice = user!.voice,
            guildId = interaction.guildId,
            { musicQueueManager } = client,
            queue = musicQueueManager.get(guildId);

        if (!queue) {
            queue = new MusicQueue(guildId);
            musicQueueManager.set(guildId, queue);
        }

        let isPlaying = queue.length != 0;

        if (!userVoice.channel)
            return interaction.reply('Join a voice channel to use this command.');
        
        interaction.deferReply();

        joinVoiceChannel({
            channelId: userVoice.channel.id,
            guildId: user.guild.id,
            adapterCreator: user.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
        })

        let connection = getVoiceConnection(interaction.guildId!);
        if (!connection) interaction.editReply('Could not join channel.')
    
        processQuery(interaction).then(async (songs: VideoResult[]) => {
            if (!isPlaying) {
                let volume = await getVolume(interaction.guildId)
                playQueue(connection!, queue!, volume)
                    .then(player => client.audioPlayers.set(interaction.guildId!, player));
                interaction.editReply(`Now playing ${songs[0].title} in ${userVoice!.channel!.name}`);
            }
            else interaction.editReply(`Added ${(songs.length > 1) ? songs.length + ' items ' : songs[0].title} to the queue.`);
            global.clearTimeout(queue!.leaveTimeout);
        }).catch(err => {
            if (err == 'no_songs') err = `Unable to find song: ${interaction.options.getString('query')!}`;
            interaction.followUp(err);
            client.logger.log({
                level: 'error',
                label: 'music',
                message: err,
            });
        });
        
    },
};
