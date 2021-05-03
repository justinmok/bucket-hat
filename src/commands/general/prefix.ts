import { Firestore } from '@google-cloud/firestore';
import type { Message} from 'discord.js';
import { BotClient } from '../../../typings';

const db = new Firestore({
    projectId: 'keylimepie',
    keyFilename: '../gcloudauth.json'
});

module.exports = {
    name: 'prefix',
    category: 'Admin',
    description: 'View or modify the server bot prefix',
    usage: 'prefix [prefix]',
    execute(message: Message, args) {
        const client = message.client as BotClient;
        const guildId = message.guild?.id ?? '';
        const prefixes = client.prefixes;
        const isDefault = !(prefixes.has(guildId));

        console.log(isDefault);
        if (!args.length) {
            const prefix = (isDefault) ? client.defaultPrefix : prefixes.get(guildId);
            message.channel.send(`The ${(isDefault ? 'default' : 'current')} prefix is \`${prefix}\`.\nYou can change it using \`${prefix}prefix [custom_prefix]\``);
        } else {
            const filter = msg => /^(yes)|(^no)|^(ya)|^(nope)|(^y$)|(^n$)/gi.test(msg.content);
            const prefix = args[0].trim();
            message.channel.send(`The server's prefix will be changed to \`${prefix}\`. Are you sure you want to do this? (Y/N)`)
                .then(() => {
                    let collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000 });
                    collector.on('collect', msg => {
                        if (/^(yes)|^(ya)|(^y$)/gi.test(msg.content)) {
                            client.prefixes.set(guildId, prefix);
                            db.doc('config/prefixes').update({guildId: prefix});
                            msg.react('👍');
                            collector.stop('changed');
                        } else return;
                    });
                    collector.on('end', (collected, reason) => {
                        if (reason == 'changed') return;
                        message.channel.send('Cancelled due to timeout');
                    });
                });
        }
    }
};