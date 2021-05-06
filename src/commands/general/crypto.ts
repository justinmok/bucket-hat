import { DiscordAPIError, Message, MessageAttachment } from "discord.js";

import { queryCrypto } from "../../util";
const { cryptoEmbed } = require('../../embeds/types');
const { generateGraph } = require('../../embeds/cryptoEmbed');
module.exports = {
    name: 'crypto',
    category: 'General',
    usage: 'crypto [ticker]',
    description: 'gets ticker idk',
    execute(message: Message, args: string[]) {
        let client = message.client;
        if (args.length == 0) return;

        queryCrypto(args[0], args[1]).then(async res => {
            let embed = await cryptoEmbed(res);
            //let graph = await generateGraph(res);
            //let attachment = new MessageAttachment(graph, 'graph.png')
            let msg = await message.channel.send(`<@${message.author.id}>`, embed);
        }).catch(e => {
            message.reply(`failed ${e}`);
        })
    }
};