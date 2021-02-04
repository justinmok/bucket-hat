// match youtube regex
const youtubedl = require('youtube-dl');
const { parseSpotify } = require('./spotifyUtils');
const ytRegex = /(youtu\.be|youtube\.com)/;

const playQueue = (connection, queue) => {
    if (queue.length == 0) return;
    let url = queue[0].query;
    console.log(url);
    let stream = youtubedl(`https://www.youtube.com/watch?v=${queue[0].info.id}`);
    console.log('now playing: ', queue[0].title);

    connection.play(stream, { passes: 3, bitrate: 'auto', highWaterMark: 1 << 25 })
        .on('finish', () => {
            queue.shift();
            playQueue(connection, queue);
        }).on('error', error => console.error(error));
};

const queryParser = (query) => {
    return new Promise(resolve => {
        if (query.includes('spotify')) parseSpotify(query).then(songs => resolve(songs));
        else if (!(ytRegex.test(query))) resolve([`ytsearch1: + ${query}`]);
        else resolve(new Array(query));
    });

};

const processQuery = (query, message) => {
    return new Promise(resolve => {
        let { musicQueue } = message.client;
        queryParser(query).then(parsedQuery => {
            console.log(parsedQuery);
            for (const song of parsedQuery) {
                youtubedl.getInfo(song, (err, info) => {
                    if (err) throw err;
                    musicQueue.push({
                        query: query,
                        title: info.title,
                        requester: message.author,
                        info: info,
                    });
                    resolve(info);
                });
            }

        }).catch(err => console.log(err));

    });

};



module.exports = {
    playQueue,
    processQuery
};