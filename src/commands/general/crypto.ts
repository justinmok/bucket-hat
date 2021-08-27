import type { CommandInteraction } from "discord.js";

import { queryCrypto } from "../../util";
const { cryptoEmbed } = require('../../embeds/types');

module.exports = {
    name: 'crypto',
    category: 'General',
    description: 'gets ticker idk',
    options: [{
        type: 'STRING',
        name: 'ticker',
        description: 'Name of the cryptocurrency (ex: DOGE BTC)',
        required: true,
    },
    {
        type: 'STRING',
        name: 'currency',
        description: 'The fiat currency to compare prices to. Defaults to USD if not provided',
        required: false,
    }
    ],
    execute(interaction: CommandInteraction) {
        let ticker = interaction.options.getString('ticker')!;
        let currency = interaction.options.getString('currency') ?? undefined;

        queryCrypto(ticker, currency).then(async res => {
            let embed = await cryptoEmbed(res);
            interaction.reply(embed);
        });
    }
};