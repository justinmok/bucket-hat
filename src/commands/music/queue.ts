import { Message } from "discord.js";
import { BotClient } from "../../../typings";

const { queueEmbed } = require('../../embeds/types');

/* TODO:
search in queue
queue controls as reactions (remove, up, down, duplicate)
*/
module.exports = {
    name: 'queue',
    category: 'Music',
    description: 'Sends a list of commands',
    usage: '[position]',

    execute(message: Message, args: string[]) {
        const { musicQueue } = message.client as BotClient;
        if (!musicQueue.length) return;
        if (args.length == 0) {
            let embed = queueEmbed(musicQueue);
            message.channel.send(embed);
        } 
    },
};