// match youtube regex
const youtubedl = require('youtube-dl');
const { parseSpotify } = require('./spotifyUtils');
const ytRegex = /(youtu\.be|youtube\.com)/;

const playQueue = (connection, queue) => {
    if (queue.length == 0) return;
    let stream = youtubedl(`https://www.youtube.com/watch?v=${queue[0].info.id}`);
    console.log('Now Playing: ', queue[0].title);

    connection.play(stream, { bitrate: 'auto', highWaterMark: 1 << 25 })
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

const getInfo = song => {
    return new Promise(resolve => {
        youtubedl.getInfo(song, (err, info) => {
            if (err) throw err;
            resolve({
                title: info.title,
                info: info,
            });
        });
    });
};

const processQuery = (query, message) => {
    return new Promise(resolve => {
        let { musicQueue } = message.client;
        queryParser(query).then(parsedQuery => {
            do {
                getInfo(parsedQuery.shift()).then(info => {
                    musicQueue.push({...info, query, requester: message.member});
                    resolve(info);
                });
            } while (parsedQuery.length);
        }).catch(err => console.log(err));

    });

};



module.exports = {
    playQueue,
    processQuery
};