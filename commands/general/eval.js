module.exports = {
    name: 'eval',
    category: 'Admin',
    usage: 'eval [js expression]',
    description: 'Evaluates Javascript expressions',
    execute(message, args) {
        let client = message.client;
        try {
            let evaled = eval(args.join(' '));
            evaled = require('util').inspect(evaled);
            message.channel.send(`\`\`\`js\n${evaled}\`\`\``);
        } catch (error) {
            message.channel.send(`An error occured when evaluating expression: \`\`\`\n${error}\`\`\``);
        }
    }
};