/**
 * Self destruct channel
 */

 import { SlashCommandBuilder } from "@discordjs/builders";
 import { CommandInteraction } from "discord.js";
 
 const slashCommand = new SlashCommandBuilder()
     .setName('selfdestruct')
     .setDescription('configure self destruct options')
     .addSubcommand(sub =>
        sub.setName('delay')
        .setDescription('Modify the amount of time before self-destructing messages are deleted')
        .addIntegerOption(opt =>
            opt.setName('time')
            .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName('modifier')
            .addChoice('millisecond', 'ms')
            .addChoice('second', 's')
            .addChoice('minute', 'm')
            .addChoice('hour', 'h')
            .addChoice('day', 'd')
        )
     )
     .addSubcommandGroup(subg =>
        subg.setName('toggle')
        .addSubcommand(cmd =>
            cmd.setName('channel')
            .setDescription('Set')
            .addChannelOption(opt =>
                opt.setName('channel')
                .setRequired(false)
                .setDescription('The channel to toggle self destructing messages on. Uses the current channel if empty.')
            )
        )
        .addSubcommand(cmd =>
            cmd.setName('roulette')
            .setDescription('Toggle roulette mode for a self-destructing channel')
        )
     )
 
 module.exports = {
     data: slashCommand,
     category: 'Admin',
     execute(interaction: CommandInteraction) {
        switch(interaction.commandName) {
            case '':
                break;
            default:
        }
     }
 };