import { Message } from "discord.js";
import { pingServer } from './utils/minecraft';

// https://stackoverflow.com/a/106223
const ValidIpAddressRegex = "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$";
const ValidHostnameRegex = "^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$";

module.exports = {
    name: 'mcserver',
    category: 'General',
    usage: '[host]',
    description: 'Gets the status of a Minecraft server',
    async execute(message: Message, args: string[]) {
        if (args.length < 1) return;
        
        let host = args[0].split(':');
        let port = parseInt(host[1]) || 25565;

        if (!(host[0].match(ValidIpAddressRegex))
            && !(host[0].match(ValidHostnameRegex)))
            return message.channel.send(`\`${host[0]}\` is not a valid hostname or IP`);
        
        let statusMessage = await message.channel.send(`Pinging ${host[0]}`);
        pingServer(host[0], port).then(response => {
            return statusMessage.edit([response.description.text, response.ping + ' ms', response.version.name].join('\n'));
        }).catch(err => {
            return statusMessage.edit(`Response returned\n\`\`\`\n${err}\`\`\``);
        });
    }
}