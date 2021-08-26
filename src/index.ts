/*
todo: permissions based commands
*/
import * as Discord from 'discord.js'
import { REST } from '@discordjs/rest';

import { getVoiceConnection } from '@discordjs/voice';
import { queryConfig, getCommands} from './util'
import type { BotClient } from '../typings/index';

const rest = new REST({ version: '9'});
const client = new Discord.Client({
    intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MEMBERS']
}) as BotClient;
client.commands = new Map();
client.musicQueue = [];
client.audioPlayers = new Map();

client.once('ready', async () => {
    if (client.user)
    console.log(`Succesfully logged into ${client.user.tag}`);
    
    let commands = await getCommands();
    client.commands = commands;

    await client.application?.commands.fetch();
    console.log(`Loaded ${client.application?.commands.cache.size} commands.`);
});

client.on('interaction', async interaction => {
    if (!interaction.isCommand() || !interaction.guild) return;
    const command = interaction.commandName;
    try {
        client.commands.get(command)?.execute(interaction);
    } catch (e) {
        console.log(e);
        interaction.webhook.send(`OOPSIE WOOPSIE!! Uwu We make a fucky wucky!! A wittle fucko boingo! The code monkeys <@148521718388883456> at our headquarters are working VEWY HAWD to fix this! There was an error executing \`${command}\`.\nStacktrace: \`\`\`${e.stack}\`\`\``)
    }
});

client.on('messageCreate', message => {
    if (message.author.id == '359112475066499083' && message.content.startsWith('refresh')) {
        console.log('Refresh Called');
        client.application?.commands.fetch().then(async cmds => {
            for (const cmd of cmds) await client.application?.commands.delete(cmd[1]);
            console.log('Refresh - Removed all commands');
            for (const cmd of client.commands) {
                console.log(`Refresh - Adding ${cmd[1].name}`);
                await client.application?.commands.create({
                    name: cmd[1].name,
                    description: cmd[1].description,
                    options: cmd[1].options ?? null
                })
            }
            console.log(`Refresh - inished adding ${client.application?.commands.cache.size} commands.`);
        })
    }
});

// AFK Timeout (5 minutes)
client.on('voiceStateUpdate', (pre, next) => {
    let connection = getVoiceConnection(pre.guild.id);
    if (client.musicQueue.length == 0 && connection) {
        let channelId = connection?.joinConfig.channelId;
        if (channelId == pre.channel?.id &&
            (!(pre.channel?.members.size) || pre.channel.members.size < 2))
                client.channelTimeout = setTimeout(() => { connection!.destroy() }, 300000);
    }
});

queryConfig().then(config => {
    let token = config.token;
    if (process.env.NODE_ENV == 'dev') token = config.testToken;
    console.log(`Logging in with token ***********${token.slice(-8)}`);
    rest.setToken(token)
    client.login(token);
});