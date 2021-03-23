import type { Message } from 'discord.js';
import { ClientWithMusic } from '../../../typings';

module.exports = {
    name: 'remove',
    category: 'Music',
    description: 'Removes item in queue position',
    usage: '[position]',

    execute(message: Message, args: string[]) {
        let { musicQueue } = message.client as ClientWithMusic;
        if (!musicQueue.length) return;
        if (args.length == 0) return message.channel.send('Specify an item in the queue to remove.');
        let queuePos = parseInt(args[0]) - 1;
        if (queuePos > musicQueue.length) return 0;
        musicQueue.splice(queuePos, 1);
    },
};