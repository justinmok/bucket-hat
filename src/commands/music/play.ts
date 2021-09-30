import type { CommandInteraction, GuildMember } from "discord.js";
import type { BotClient, VideoResult } from "../../../typings";
import { getVolume } from "../../util";

import { getVoiceConnection, joinVoiceChannel } from '@discordjs/voice'
import { playQueue, processQuery } from '../utils/musicUtils'
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
        if (!interaction.options.getString('query')) return;
        let client = interaction.client as BotClient;
        let user = interaction.member as GuildMember;
        let userVoice = user!.voice;
        let { musicQueue } = client;
        let isPlaying = musicQueue.length != 0;

        if (!userVoice.channel)
            return interaction.reply('Join a voice channel to use this command.');
        
        interaction.deferReply();

        joinVoiceChannel({
            channelId: userVoice.channel.id,
            guildId: user.guild.id,
            adapterCreator: user.guild.voiceAdapterCreator
        })

        let connection = getVoiceConnection(interaction.guildId!);
        if (!connection) interaction.editReply('Could not join channel.')
    
        processQuery(interaction).then(async (songs: VideoResult[]) => {
            if (!isPlaying) {
                let volume = await getVolume(interaction.guild!.id)
                playQueue(connection!, musicQueue, volume)
                    .then(player => client.audioPlayers.set(interaction.guildId!, player));
                interaction.editReply(`Now playing ${songs[0].title} in ${userVoice!.channel!.name}`);
            }
            else interaction.editReply(`Added ${(songs.length > 1) ? songs.length + ' items ' : songs[0].title} to the queue.`);
        }).catch(err => console.log(err));

        if (client.channelTimeout) clearTimeout(client.channelTimeout);
    },
};
