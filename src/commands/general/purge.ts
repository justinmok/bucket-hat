import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, Message, Permissions, RateLimitError } from "discord.js";

const slashCommand = new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Removes given amount of messages')
    .addIntegerOption(option =>
        option.setName('amount')
        .setDescription('number of messages to remove')
        .setRequired(true))

const deferAttempt = (message: Message): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
        message.delete().catch(e => {
            if (e instanceof RateLimitError) {
                console.log('limited');
                setTimeout(() => resolve(deferAttempt(message)), 2000);
            } else {
                resolve(false)
            }
        }).then(() => resolve(true));
    });
}

/* dont even bother with this mess */
const generateStatusBar = (count, total, length): string => {
    return '| ' + 'x'.repeat(Math.round(( (count / total) * length))) + ' '.repeat( 1.1 * ((total - count) / total) * length) + ' |';
};

module.exports = {
    data: slashCommand,
    category: 'Admin',
    async execute(interaction: CommandInteraction) {
        let member = interaction.member as GuildMember
        let channel = interaction.channel!

        if (!member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) return interaction.reply('You must have the `Manage Channels` permission in order to use this command.')
        
        await interaction.deferReply({ ephemeral: true });

        let options = {
            limit: interaction.options.getInteger('amount', true)
        }

        let start = process.hrtime.bigint();

        channel.messages.fetch(options).then(msgs => {
            let finished = false;
            let count = 0;
            let err = 0;

            let status = setInterval(() => {
                if (finished) {
                    clearInterval(status);
                    console.log(finished);
                    let time = ((Number((process.hrtime.bigint() - start) / BigInt(Math.pow(10, 9))) * 10) / 10).toFixed(1)
                    interaction.editReply(`✅ Attempt to delete ${msgs.size} messages finished in ${time}s.${(err) ? `\`${err}\` messages were unable to be removed.` : ''}`);
                }
                else interaction.editReply(`<a:loading:942891537199669310> Deleting messages: ${count}/${msgs.size} ${generateStatusBar(count, msgs.size, 10)} ${((count/msgs.size) * 100).toFixed(1)}%`);
            }, 1000)

            Array.from(msgs.values()).forEach((m, i, a) => {
                setTimeout(() => {
                    m.delete().then(() => {
                        count++;
                        finished = ( i == a.length - 1 );
                    }).catch(() => err++);
                }, i * 50);
            });

        });
    }
};