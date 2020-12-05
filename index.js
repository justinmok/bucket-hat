const Discord = require('discord.js');
const fs = require('fs');

let config = require('./config.json');
let prefixes = require('./prefixes.json');
const { token, defaultPrefix } = config;

const client = new Discord.Client();
client.commands = new Discord.Collection();

let commandsDir = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandsDir) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log(`Succesfully logged into ${client.user.tag}`);
});

client.on('message', message => {
    /* Message checking */
    const messageGuild = message.channel.guild.id;
    const prefix = (messageGuild in prefixes) ?  prefixes['messageGuild'] : defaultPrefix;
    if (typeof message.channel == Discord.TextChannel || message.author.bot || !message.content.startsWith(prefix)) return;
    
    /* Retrieving command info */
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    /* Command does not exist */
    if (!client.commands.has(command)) return;

    /* Execute command */
    try {
        client.commands.get(command).execute(message, args);
    } catch (error) {
        console.log(error);

        /* User feedback, logs error to file */
        message.channel.send(`OOPSIE WOOPSIE!! Uwu We make a fucky wucky!! A wittle fucko boingo! The code monkeys at our headquarters are working VEWY HAWD to fix this! There was an error executing \`${command}\`.\nStacktrace: \`\`\`${error.stack}\`\`\``).then(() => {
            fs.writeFileSync(`./logs/${Date.now()}.error.log`, error);
        });
    }
});

console.log(`Logging in with token ${token}`);
client.login(token);