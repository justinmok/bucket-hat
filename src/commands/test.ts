import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommand } from './Command.js';

const execute = (interaction: ChatInputCommandInteraction): void => {
    console.log('hello test');
}

const command = new SlashCommand(execute).setCategory('General').setName('test2').setDescription('asdkjljaskl')

export default command;