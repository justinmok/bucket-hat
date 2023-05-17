import type { Interaction } from 'discord.js';

export const interactionHandler = async (interaction: Interaction) => {
    if (!interaction.isCommand() || !interaction.guild) return;

    const command = interaction.commandName;
    const client = interaction.client;

    try {
        /* Check if command actually exists and has a function */
        if (
            !client.commands.get(command) ||
            client.commands.get(command)?.execute == undefined
        ) {
            console.log(client.commands.get(command));
            throw `Command ${command} does not exist in client`;
        } else {
            client.commands.get(command)!.execute(interaction);
            client.logger.log({
                level: 'debug',
                label: 'main',
                guild: interaction.guild,
                channel: interaction.channel,
                user: interaction.user,
                message: `Ran command ${command}`,
            });
        }
    } catch (e) {
        client.logger.log({
            level: 'error',
            label: 'main',
            message: e.stack ?? e,
        });
    }
};
