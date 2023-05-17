import { ChatInputCommandInteraction } from 'discord.js';
import SlashCommand from './Command.js';

const execute = (interaction: ChatInputCommandInteraction): void => {
    interaction.reply('hello world');
};

const command = new SlashCommand(execute);
command.data.setName('test2').setDescription('asdasdas');

export default command;
