const youtubedl = require('youtube-dl');

let processQueue = (connection, queue) => {
    if (queue.length == 0) return;
    let url = queue[0].query;
    let stream = youtubedl(url, ['--format=bestaudio']);
    console.log(url);
    connection.play(stream, { volume: 0.5});
    console.log('now playing: ', queue[0].title);

    stream.on('error', (error) => {
        throw error;
    });

    stream.on('end', (reason) => {
        console.warn(`ended reason: ${reason}`);
        queue.shift();
        processQueue(connection, queue);
    });
};

module.exports = {
    name: 'play',
    category: 'General',
    description: 'Plays a youtube video in the vc lol',
    usage: '[youtube link]',
    execute(message, args) {
        if (!args.length) return;
        let user = message.member;
        let voice = user.voice;
        let { musicQueue } = message.client;
        let isPlaying = musicQueue.length != 0;

        let query = args.join(' ');
        if (!query.includes('.com')) query = 'ytsearch1:' + query;
        //if (!query.includes('youtube')) return message.channel.send(`\`${url}\` was not a valid Youtube url.`);

        // get into
        youtubedl.getInfo(query, (err, info) => {
            if (err) throw err;
            musicQueue.push({
                query: query,
                title: info.title,
                requester: user,
                info: info,
            });

            if (!voice.channel)
                return message.channel.send('You are not in a voice channel.');

            voice.channel.join().then((connection) => {
            // check if there is a queue
                console.log(isPlaying);
                if (!isPlaying) processQueue(connection, musicQueue);
                else message.channel.send(`Added ${musicQueue.slice(-1)[0].title} to the queue.`);
            });
        });

        // join and play
        
    },
};
