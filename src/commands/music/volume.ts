import type { CommandInteraction } from 'discord.js';
import type { BotClient } from '../../../typings/index';
import { updateVolume } from '../../util';

module.exports = {
    name: 'volume',
    category: 'Music',
    description: 'Changes the volume of the bot',
    options: [{
        type: 'INTEGER',
        name: 'percent',
        description: 'Number between 0 and 200',
        required: true
    }],
    execute(interaction: CommandInteraction) {
        let { musicQueue, audioPlayers } = interaction.client as BotClient;
        let guild = interaction.guild!.id!;
        let volume = interaction.options.getInteger('percent')! / 100;
        
        updateVolume(guild, volume);
        // todo: update volume in realtime
        interaction.reply(`Set the volume to ${volume * 100}%. Changes will take effect on the next song.`);
    },
};