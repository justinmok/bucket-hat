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
        let client = interaction.client as BotClient;
        let guild = interaction.guild!.id!;
        let volume = interaction.options[0].value as number / 100;
        
        updateVolume(guild, volume);
        if (client.musicQueue.length)
            client.voice?.connections.get(guild)?.dispatcher?.setVolume(volume);

        interaction.reply(`Set the volume to ${volume * 100}%`);
    },
};