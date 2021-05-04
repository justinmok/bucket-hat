import { Message } from "discord.js";
import { queryCrypto } from "../../util";
const { cryptoEmbed } = require('../../embeds/types');

module.exports = {
    name: 'crypto',
    category: 'General',
    usage: 'crypto [ticker]',
    description: 'gets ticker idk',
    execute(message: Message, args: string[]) {
        let client = message.client;
        if (args.length == 0) return;

        queryCrypto(args[0], args[1], args[2]).then(res => {
            let embed = cryptoEmbed(res);
            message.channel.send(`<@${message.author.id}>`, embed);
        }).catch(e => {
            message.reply(`failed ${e}`);
        })
    }
};