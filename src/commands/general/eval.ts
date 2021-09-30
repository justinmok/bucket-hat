import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, Permissions } from "discord.js";

const slashCommand = new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Evaluates Javascript expressions')
    .addStringOption(option =>
        option.setName('expression')
        .setDescription('The Javascript expression to run')
        .setRequired(true))

module.exports = {
    data: slashCommand,
    category: 'Admin',
    execute(interaction: CommandInteraction) {
        let member = interaction.member as GuildMember
        if (!member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) interaction.reply('You must have the `Manage Channels` permission in order to use this command.')
        try {
            let expression = interaction.options.getString('expression')!;
            let evaled = require('util').inspect(eval(expression));
            interaction.reply(`\`\`\`js\n${evaled}\`\`\``);
        } catch (error) {
            interaction.reply(`An error occured when evaluating expression: \`\`\`\n${error}\`\`\``);
        }
    }
};