const youtubedl = require('youtube-dl');

let processQueue = (connection, queue) => {
    if (queue.length == 0) return;
    let url = queue[0].query;
    console.log(url);
    let stream = youtubedl(url);
    console.log('now playing: ', queue[0].title);

    connection.play(stream, { passes: 3, bitrate: 'auto' })
        .on('finish', () => {
            queue.shift();
            processQueue(connection, queue);
        }).on('error', error => console.error(error));
};


module.exports = {
    name: 'play',
    category: 'General',
    description: 'Plays a youtube video in the vc lol',
    usage: '[youtube link]',
    processQueue,
    execute(message, args) {
        if (!args.length) return;
        let user = message.member;
        let voice = user.voice;
        let { musicQueue } = message.client;
        let isPlaying = musicQueue.length != 0;

        if (!voice.channel)
            return message.channel.send('Join a voice channel to use this command.');

        let query = args.join(' ');
        if (!query.includes('.com')) query = 'ytsearch1:' + query;
    

        voice.channel.join().then((connection) => {
            youtubedl.getInfo(query, (err, info) => {
                if (err) throw err;
                musicQueue.push({
                    query: query,
                    title: info.title,
                    requester: user,
                    info: info,
                });

                if (!isPlaying) {
                    message.channel.send(`Now playing ${info.title} in ${voice.channel.name}`);
                    processQueue(connection, musicQueue);
                }
                else message.channel.send(`Added ${musicQueue.slice(-1)[0].title} to the queue.`);
            });
        });

    },
};
