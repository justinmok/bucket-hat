module.exports = {
    helpAllEmbed(commands) {
        return require('./helpAllEmbed').createEmbed(commands);
    },
    helpEmbed(commandName, command) {
        return require('./helpEmbed').createEmbed(commandName, command);
    },
    queueEmbed(queue) {
        return require('./queueEmbed').createEmbed(queue);
    }
};