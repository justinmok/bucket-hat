import { Message } from "discord.js";

module.exports = {
    name: 'resume',
    category: 'Music',
    description: 'Resumes the music',
    usage: '',

    execute(message: Message, args: string[]) {
        let client = message.client;
        if (message.guild && client.voice)
        client.voice.connections.get(message.guild.id)?.dispatcher?.resume();
    }
}