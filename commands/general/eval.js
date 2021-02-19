module.exports = {
    name: 'eval',
    category: 'admin',
    description: 'fuck up my pc',
    execute(message, args) {
        try {
            const evaled = eval(args.join(' '));
            message.channel.send(`\`\`\`js\n${evaled}\`\`\``);
        } catch (error) {
            message.channel.send('fuck tehre was na error oopsie' + error);
        }
    }
};