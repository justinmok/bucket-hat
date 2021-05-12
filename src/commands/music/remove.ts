import type { CommandInteraction } from 'discord.js';
import type { BotClient } from '../../../typings';

module.exports = {
    name: 'remove',
    category: 'Music',
    description: 'Removes item in queue position',
    options: [{
        type: 'INTEGER',
        name: 'item',
        description: '# in the queue to remove',
        required: true
    }],
    execute(interaction: CommandInteraction) {
        let { musicQueue } = interaction.client as BotClient;
        if (!musicQueue.length) return;
        let queuePos = interaction.options[0].value as number;
        if (queuePos > musicQueue.length) return 0;
        let removed = musicQueue.splice(queuePos, 1);
        interaction.reply(`Removed ${removed[0].match.title} from the queue.`);
    },
};