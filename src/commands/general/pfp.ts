import type { CommandInteraction } from "discord.js";

module.exports = {
    name: 'pfp',
    category: 'General',
    description: 'Retrieve profile picture of desired user',
    options: [{
        type: 'USER',
        name: 'user',
        description: 'The user to retrieve the profile picture from',
        required: true
    }],
    execute(interaction: CommandInteraction) {
        let user = interaction.options[0].user!;
        if (!user.avatar) interaction.reply('The user provided either has a default avatar or the bot is broken.');
        else interaction.reply(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=512`);
    }
};