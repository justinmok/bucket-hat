import type { CommandInteraction, GuildMember } from "discord.js";
import type { BotClient, VideoResult } from "../../../typings";
import { getVolume } from "../../util";

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
        if (!interaction.options[0].value) return;
        let client = interaction.client as BotClient;
        let user = interaction.member as GuildMember;
        let voice = user!.voice;
        let { musicQueue } = client;
        let isPlaying = musicQueue.length != 0;

        if (!voice.channel)
            return interaction.reply('Join a voice channel to use this command.');
        
        interaction.defer();
        voice.channel.join().then((connection) => {
            processQuery(interaction).then(async (info: VideoResult) => {
                if (!isPlaying) {
                    let volume = await getVolume(interaction.guild!.id)
                    playQueue(connection, musicQueue, volume);
                    interaction.editReply(`Now playing ${info.title} in ${voice!.channel!.name}`);
                }
                else interaction.editReply(`Added ${info.title} to the queue.`);
            }).catch(err => console.log(err));

            if (client.channelTimeout) clearTimeout(client.channelTimeout);
        });
    },
};
