import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageAttachment } from "discord.js";
import { createEmbed, getAttachment } from "../../embeds/minecraftEmbed";
import { pingServer } from '../utils/minecraftUtils';

/** https://stackoverflow.com/a/106223 */
const ValidIpAddressRegex = "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$";
const ValidHostnameRegex = "^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$";

const slashCommand = new SlashCommandBuilder()
    .setName('mcserver')
    .setDescription('Gets the status of a Minecraft server')
    .addStringOption(option =>
        option.setName('hostname')
        .setDescription('The IP address of the Minecraft server')
        .setRequired(true))

module.exports = {
    data: slashCommand,
    category: 'General',
    async execute(interaction: CommandInteraction) {
        let hostString = interaction.options.getString('hostname')!;
        let host = hostString.split(':');
        let port = parseInt(host[1]) || 25565;

        if (!(host[0].match(ValidIpAddressRegex))
            && !(host[0].match(ValidHostnameRegex)))
            return interaction.reply(`\`${host[0]}\` is not a valid hostname or IP`);
        
        interaction.deferReply();
        pingServer(host[0], port).then(async response => {
            let embed = await createEmbed(response);
            let attachment = await getAttachment(response.favicon!);
            return interaction.editReply({embeds: [embed], files: [attachment]});
        }).catch(err => {
            return interaction.editReply(`Response returned\n\`\`\`\n${err}\`\`\``);
        });
    }
}