import type { CommandInteraction, GuildMember } from "discord.js";
import type { BotClient, VideoResult } from "../../../typings";
import { getVolume } from "../../util";

import { getVoiceConnection, joinVoiceChannel } from '@discordjs/voice'
import { playQueue, processQuery } from '../utils/musicUtils'

module.exports = {
    name: 'play',
    category: 'Music',
    description: 'Plays a youtube video in the vc lol',
    options: [{
        type: 'STRING',
        name: 'query',
        description: 'The YouTube link or search query to play',
        required: true
    }],
    playQueue,
    execute(interaction: CommandInteraction) {
        if (!interaction.options.getString('query')) return;
        let client = interaction.client as BotClient;
        let user = interaction.member as GuildMember;
        let voice = user!.voice;
        let { musicQueue } = client;
        let isPlaying = musicQueue.length != 0;

        if (!voice.channel)
            return interaction.reply('Join a voice channel to use this command.');
        
        interaction.deferReply();

        joinVoiceChannel({
            channelId: voice.channel.id,
            guildId: user.guild.id,
            adapterCreator: user.guild.voiceAdapterCreator
        })

        let connection = getVoiceConnection(interaction.guildId!);
        if (!connection) interaction.reply('Could not join channel.')
    
        interaction.reply('Searching...')
        processQuery(interaction).then(async (songs: VideoResult[]) => {
            if (!isPlaying) {
                let volume = await getVolume(interaction.guild!.id)
                playQueue(connection!, musicQueue, volume)
                    .then(player => client.audioPlayers.set(interaction.guildId!, player));
                interaction.editReply(`Now playing ${songs[0].title} in ${voice!.channel!.name}`);
            }
            else interaction.editReply(`Added ${(songs.length > 1) ? songs.length + ' items ' : songs[0].title} to the queue.`);
        }).catch(err => console.log(err));

        if (client.channelTimeout) clearTimeout(client.channelTimeout);
    },
};
