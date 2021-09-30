import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";
import { queryCrypto } from "../../util";

const { cryptoEmbed } = require('../../embeds/types');
const slashCommand = new SlashCommandBuilder()
    .setName('crypto')
    .setDescription('Retrieves latest cryptocurrency exchange rates')
    .addStringOption(option =>
        option.setName('ticker')
        .setDescription('Name of the cryptocurrency (ex: DOGE, BTC)')
        .setRequired(true))
    .addStringOption(option =>
        option.setName('currency')
        .setDescription('The fiat currency to compare prices to. Defaults to USD if not provided')
        .setRequired(false))

module.exports = {
    data: slashCommand,
    category: 'General',
    execute(interaction: CommandInteraction) {
        let ticker = interaction.options.getString('ticker')!;
        let currency = interaction.options.getString('currency') ?? undefined;

        queryCrypto(ticker, currency).then(async res => {
            let embed = await cryptoEmbed(res);
            interaction.reply(embed);
        });
    }
};