module.exports = {
    name: 'queue',
    category: 'General',
    description: 'get the queue of the music bot',
    usage: '[@user]',
    execute(message, args) {
        let queue = message.client.musicQueue;
        if (!queue.length) message.channel.send('The queue is empty.');
        message.channel.send(queue[0].title);
    }
};