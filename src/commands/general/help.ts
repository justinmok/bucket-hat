import type { CommandInteraction } from "discord.js";
import { BotClient } from "../../../typings";

const { helpAllEmbed, helpEmbed } = require('../../embeds/types.js');

module.exports = {
    name: 'help',
    category: 'General',
    description: 'Sends a list of commands',
    options: [{
        type: 'STRING',
        name: 'command',
        description: 'The command you want information from',
        required: false
    }],
    execute(interaction: CommandInteraction) {
        const { commands } = interaction.client as BotClient;
        if (!interaction.options.length) {
            let embed = helpAllEmbed(commands);
            interaction.reply(embed);
        } else {
            let commandName = interaction.options[0].value as string;
            if (!commands.has(commandName)) {
                return interaction.reply('That command does not exist.');
            }
            let embed = helpEmbed(commandName, commands.get(commandName));
            interaction.reply(embed);
        }
    },
};