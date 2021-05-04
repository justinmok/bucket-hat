import * as Discord from 'discord.js';

import type { cryptoInfo } from '../../typings/index'

module.exports = {
    name: 'cryptoEmbed',
    createEmbed(info: cryptoInfo) {
        let embed = new Discord.MessageEmbed()
            .setColor('#dddddd')
            .setTitle(`1 ${info.ticker.toUpperCase()} = ${info.price} ${info.price_base.toUpperCase()}`)
            .setThumbnail(`https://github.com/spothq/cryptocurrency-icons/raw/master/128/white/${info.ticker.toLowerCase()}.png`)
            .setTimestamp()
            .setDescription(`Last reported price on ${info.exchange[0].toUpperCase() + info.exchange.slice(1)}`)
            .setFooter('Bucket Hat Bot', 'https://cdn.discordapp.com/avatars/783886978974220338/9e5abce14cce133de8c6145e556ee725.png?size=32')

        return embed;
    }
};