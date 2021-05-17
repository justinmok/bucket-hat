module.exports = {
    queueEmbed(queue) {
        return require('./queueEmbed').createEmbed(queue);
    },
    cryptoEmbed(info) {
        return require('./cryptoEmbed').createEmbed(info);
    }
};