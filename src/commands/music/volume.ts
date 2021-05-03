import type { BotClient } from '../../../typings/index';
import { updateVolume } from '../../util';

module.exports = {
    name: 'volume',
    category: 'Music',
    description: 'Changes the volume of the bot',
    usage: '[percent]',

    execute(message, args: string[]) {
        let client = message.client as BotClient;
        let volume = parseInt(args[0]) / 100;
        if (!volume) return;
        
        updateVolume(message.guildId, volume);
        client.voice?.connections.get(message.guild.id)?.dispatcher.setVolume(volume);
    },
};