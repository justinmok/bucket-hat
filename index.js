/*
todo: dockerize, permissions based commands, categorize help menu, help menu pagination, AI stop session intent
*/

const Discord = require('discord.js');
const fs = require('fs');

//const speech = require('@google-cloud/speech');

let config = require('./config.json');
let prefixes = require('./prefixes.json');

const { token, defaultPrefix, cloudProjectID } = config;

const client = new Discord.Client();
//const speechClient = new speech.SpeechClient();

client.defaultPrefix = defaultPrefix;
client.commands = new Discord.Collection();
client.prefixes = new Discord.Collection();
client.musicQueue = [];
client.cloudProjectID = cloudProjectID;


for (const [server, prefix] of Object.entries(prefixes)) {
    client.prefixes.set(server, prefix);
}

let commandsFolder = fs.readdirSync('./commands').filter(dir => !dir.includes('utils'));
for (const folder of commandsFolder) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        console.log(command);
        client.commands.set(command.name, command);
    }
}

console.log(`Loaded ${client.commands.size} commands.`);

client.once('ready', () => {
    console.log(`Succesfully logged into ${client.user.tag}`);
});

client.on('message', message => {
    /* Message checking */
    if (message.author.id == '432610292342587392' && message.embeds[0] != undefined) message.react('😄');
    const messageGuild = message.channel.guild.id;
    const prefix = (client.prefixes.has(messageGuild)) ?  client.prefixes.get(messageGuild) : defaultPrefix;
    if (typeof message.channel == Discord.TextChannel || message.author.bot || !(message.content.startsWith(prefix))) return;
    
    /* Retrieving command info */
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    /* Command does not exist */
    if (!client.commands.has(command)) return;

    /* Update prefixes */
    client.prefixes.forEach((guild, prefix) => prefixes[prefix] = guild);
    console.warn(prefixes);
    fs.writeFileSync('./prefixes.json', JSON.stringify(prefixes, null, 4));

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
/* 
const request = {
    config: {
        encoding: 'OGG_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'en-US',
    },
    single_utterance: true,
    interimResults: false,
};


const speechDetection = speechClient.streamingRecognize(request).on('error', console.error)
    .on('data', data => {
        console.log('hello this is working?');
        if (data.results[0] && data.results[0].alternatives[0]) {
            client.guilds.cache.get('378778569465266197')
                .channels.cache.get('789948807097352242')
                .send(`some guy in vc: ${data.results[0].alternatives[0].transcript}`);
        }
    });
*/

/* const recognizeStream = speechClient
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', data =>
        console.log(
            data.results[0] && data.results[0].alternatives[0]
                ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
                : '\n\nReached transcription time limit, press Ctrl+C\n'
        )
    );


const listenConnection = connection => {
    const receiver = connection.receiver;
    

    // play muted audio in order to have client receieve incoming packets
    connection.play(fs.createReadStream('lookatme.mp3'), { volume: 0.0});

    // eslint-disable-next-line no-unused-vars 
    connection.on('speaking', (user, speaking) => { 
        // temp user id check
        if (user.id == '148521718388883456') {
            let readStream = receiver.createStream(user, { mode: 'pcm'});
            //let piped = readStream.pipe(recognizeStream);

            // debug packet len
            readStream.on('data', () => console.log(readStream.readableFlowing));
            //piped.on('pipe', pipe => console.log(`receiving: ${pipe.readableFlowing}`));

            readStream.on('end', () => {
            //    recognizeStream.end();
            });
        }
    });
};

*/
client.on('voiceStateUpdate', (oldState, newState) => {

    let user = oldState.guild.members.cache.get(oldState.id);
    // my id
    let channelPrevious = oldState.channel;
    let channelFinal = newState.channel;
    
    // eslint-disable-next-line no-unused-vars 
    let isConnected = (client.voice.connections.size > 0 || client.voice !== null);

    // Checks for following me
    if (channelFinal == channelPrevious) return;
    if (user.id != '148521718388883456') return;

    // User leaves channel
    if (channelFinal == null) {
        console.log(`Leaving ${channelPrevious.name}`);
        //channelPrevious.leave();
    }
    // User joins channel
    else if (channelPrevious == null) {
        console.log(`Joining ${channelFinal.name}`);
        //channelFinal.join().then(connection => listenConnection(connection));
    }
    // User moves channel
    else if (channelFinal !== null && channelPrevious !== null) {
        console.log(`Leaving ${channelPrevious.name}, Joining ${channelFinal.name}`);
        //channelFinal.join().then(connection => listenConnection(connection));
    }
});

console.log(`Logging in with token ***********${token.slice(-8)}`);
client.login(token);