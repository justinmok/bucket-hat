import { CommandInteraction, MessageAttachment } from "discord.js";
import { createEmbed } from "../../embeds/minecraftEmbed";
import { pingServer } from '../utils/minecraftUtils';

// https://stackoverflow.com/a/106223
const ValidIpAddressRegex = "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$";
const ValidHostnameRegex = "^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$";

module.exports = {
    name: 'mcserver',
    category: 'General',
    description: 'Gets the status of a Minecraft server',
    options: [{
        type: 'STRING',
        name: 'hostname',
        description: 'The IP address of the Minecraft server',
        required: true
    }],
    async execute(interaction: CommandInteraction) {
        let hostString = interaction.options[0].value! as string
        let host = hostString.split(':');
        let port = parseInt(host[1]) || 25565;

        if (!(host[0].match(ValidIpAddressRegex))
            && !(host[0].match(ValidHostnameRegex)))
            return interaction.reply(`\`${host[0]}\` is not a valid hostname or IP`);
        
        interaction.deferReply();
        pingServer(host[0], port).then(async response => {
            let embed = await createEmbed(response);
            return interaction.editReply({embeds: [embed]});
        }).catch(err => {
            return interaction.editReply(`Response returned\n\`\`\`\n${err}\`\`\``);
        });
    }
}