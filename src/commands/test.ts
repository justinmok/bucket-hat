import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import SlashCommand from './Command.js';

const execute = (interaction: ChatInputCommandInteraction): void => {
    console.log('hello test');
    interaction.reply('hello world');
}

const command = new SlashCommand(execute);
command.data.setName('test2').setDescription('asdasdas');

export default command;