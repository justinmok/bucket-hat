import { CommandInteraction, GuildChannel } from "discord.js";
import { startCount } from "../../util";

module.exports = {
    name: 'startcounter',
    category: 'General',
    description: 'Starts a counting channel',
    options: [{
        type: 'CHANNEL',
        name: 'channel',
        description: 'If a channel is not provided, one will be created',
        required: false
    }],
    execute(interaction: CommandInteraction) {
        let channel = interaction.options[0].channel;
        if (channel instanceof GuildChannel) {
            startCount(channel).then(channelId => {
                interaction.reply(`Counting started in <\\${channelId}>!`);
            });
        } else {
            startCount()
        }
    }
};