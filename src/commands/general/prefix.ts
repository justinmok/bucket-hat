module.exports = {
    name: 'prefix',
    category: 'Admin',
    description: 'View or modify the server bot prefix',
    usage: 'prefix [prefix]',
    execute(message, args) {
        if (!args.length) {
            const guildId = message.guild.id;
            const prefixes = message.client.prefixes;
            const isDefault = !(guildId in prefixes);
            const prefix = (isDefault) ? message.client.defaultPrefix : prefixes.get(guildId);
            message.channel.send(`The ${(isDefault ? 'default' : '')} prefix is \`${prefix}\`.\nYou can change it using \`${prefix}prefix [custom_prefix]\``);
        } else {
            const filter = msg => /^(yes)|(^no)|^(ya)|^(nope)|(^y$)|(^n$)/gi.test(msg.content);
            const prefix = args[0].trim();
            message.channel.send(`The server's prefix will be changed to \`${prefix}\`. Are you sure you want to do this? (Y/N)`)
                .then(() => {
                    let collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000 });
                    collector.on('collect', msg => {
                        if (/^(yes)|^(ya)|(^y$)/gi.test(msg.content)) {
                            message.client.prefixes.set(message.guild.id, prefix);
                            delete require.cache[require.resolve('../prefixes.json')];
                            msg.react('👍');
                            collector.stop('changed');
                        } else return;
                    });
                    collector.on('end', (collected, reason) => {
                        if (reason.includes('changed')) return;
                        message.channel.send('Cancelled due to timeout');
                    });
                });
        }
    }
};