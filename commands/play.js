const youtubedl = require('youtube-dl');

let processQueue = (connection, queue) => {
    let url = queue[0].query;
    let stream = youtubedl(url, ['--format=bestaudio']);
    console.log(url);
    connection.play(stream);
    console.log('now playing: ', queue[0].title);
    stream.on('end', () => {
        console.warn('stream ended');
        queue.pop(0);
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
        let queue = message.client.musicQueue;
        let isPlaying = queue.length != 0;

        let query = args.join(' ');
        if (!query.includes('.com')) query = 'ytsearch1:' + query;
        //if (!query.includes('youtube')) return message.channel.send(`\`${url}\` was not a valid Youtube url.`);

        // get into
        youtubedl.getInfo(query, (err, info) => {
            if (err) throw err;
            queue.push({
                query: query,
                title: info.title,
            });

            if (!voice.channel)
                return message.channel.send('You are not in a voice channel.');

            voice.channel.join().then((connection) => {
            // check if there is a queue
                console.log(isPlaying);
                console.log(queue);
                if (!isPlaying) processQueue(connection, queue);
            });
        });

        // join and play
        
    },
};
