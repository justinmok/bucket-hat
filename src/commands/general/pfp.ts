import type { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

const slashCommand = new SlashCommandBuilder()
    .setName('pfp')
    .setDescription('Retrieve profile picture of desired user')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user to retrieve the profile picture from')
            .setRequired(true))

module.exports = {
    data: slashCommand,
    category: 'General',
    execute(interaction: CommandInteraction) {
        let user = interaction.options.getUser('user')!;
        if (!user.avatar) interaction.reply('The user provided either has a default avatar or the bot is broken.');
        else interaction.reply(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=512`);
    }
};