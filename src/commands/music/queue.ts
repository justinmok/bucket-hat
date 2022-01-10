import { SlashCommandBuilder } from "@discordjs/builders";
import { getVoiceConnection } from '@discordjs/voice';
import { ButtonInteraction, Client, CommandInteraction, Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { createEmbed } from '../../embeds/queueEmbed';
import { getVolume } from "../../util";
import { MusicQueue, playQueue } from '../utils/musicUtils';

var currentPage = 1;
type QueueAction = 'shuffle' | 'clear' | 'default';
/** Declaring various Discord buttons to use depending on context */
const QueueButtons = {
    next: new MessageButton().setEmoji('⏭️').setLabel('Next').setCustomId('next').setStyle('PRIMARY'),
    nextDisabled: new MessageButton().setEmoji('⏭️').setLabel('Next').setCustomId('nextDisabled').setStyle('PRIMARY').setDisabled(true),
    shuffle: new MessageButton().setEmoji('🔀').setLabel('Shuffle').setCustomId('shuffle').setStyle('SECONDARY'),
    shuffleSuccess: new MessageButton().setEmoji('🔀').setLabel('Shuffled!').setCustomId('shuffleSuccess').setStyle('SECONDARY').setDisabled(true),
    clear: new MessageButton().setEmoji('🗑️').setLabel('Clear').setCustomId('clear').setStyle('DANGER'),
    clearSuccess: new MessageButton().setEmoji('🗑️').setLabel('Cleared!').setCustomId('clearSuccess').setStyle('DANGER').setDisabled(true),
    forwardPage: new MessageButton().setEmoji('➡️').setCustomId('forward').setStyle('PRIMARY'),
    forwardPageDisabled: new MessageButton().setEmoji('➡️').setCustomId('forwardPageDisabled').setStyle('PRIMARY').setDisabled(true),
    backPage: new MessageButton().setEmoji('⬅️').setCustomId('back').setStyle('PRIMARY'),
    backPageDisabled: new MessageButton().setEmoji('⬅️').setCustomId('backPageDisabled').setStyle('PRIMARY').setDisabled(true),
}

/**
 * createMessageButtons - Creates an action button row with specific buttons and states
 * @param action The queue action that updates the button row
 * @param queueLength The length of the queue
 * @param currentPage The current embed page shown to the user
 * @returns The action row created 
 */
const createMessageButtons = (action: QueueAction, queueLength: number): Promise<MessageActionRow> => {
    let messageActions = new MessageActionRow(),
        isLastPage = (currentPage * 5) >= queueLength;
    return new Promise<MessageActionRow>((resolve, reject) => {
        /** Page buttons creation */
        if (queueLength > 5) {
            console.log('asd', currentPage);
            if (currentPage == 1) messageActions.addComponents(QueueButtons.backPageDisabled);
            else messageActions.addComponents(QueueButtons.backPage);
            if (isLastPage) messageActions.addComponents(QueueButtons.forwardPageDisabled);
            else messageActions.addComponents(QueueButtons.forwardPage);
        }

        console.log(action);
        /** Next button disable?d */
        if (queueLength == 1) messageActions.addComponents(QueueButtons.nextDisabled)
        else messageActions.addComponents(QueueButtons.next)

        switch (action) {
            case 'default':
                messageActions.addComponents(QueueButtons.shuffle, QueueButtons.clear);
                resolve(messageActions);
                break;
            case 'shuffle':
                messageActions.addComponents(QueueButtons.shuffleSuccess, QueueButtons.clear);
                resolve(messageActions);
                break;
            case 'clear':
                /** This should only return 1 button */
                messageActions.setComponents(QueueButtons.clearSuccess);
                resolve(messageActions);
                break;
            default:
                resolve(messageActions);
                break;
        }


    });
}

/**
 * handleQueueInteraction - Gives functionality to the action row buttons
 * @param i Button interaction event collected
 * @param interaction Queue command interaction
 * @param queue The music queue object associated with the guild
 * @param currentPage The current page the embed is displaying
 * @returns void
 */
const handleQueueInteraction = async (i: ButtonInteraction, interaction: CommandInteraction, queue: MusicQueue) => {
    let messageActions = new MessageActionRow();
    let embed: MessageEmbed;
    i.deferUpdate();
    if (i.user.id != interaction.user.id) return;
    switch (i.customId) {
        /** User clicks next */
        case 'next':
            skipSong(interaction, queue);
            interaction.followUp('Skipped!');
            break;

        /** User clicks clear */
        case 'clear':
            queue.clear().then(async () => {
                messageActions = await createMessageButtons('clear', queue.length);
                embed = await createEmbed(queue.items, { page: currentPage });
                interaction.editReply({ embeds: [embed], components: [messageActions] })
            }).catch(err => {
                interaction.followUp(err);
            });
            break;

        /** User clicks shuffle */
        case 'shuffle':
            /** Shuffle queue */
            let temp = queue.items.shift();
            queue.shuffle();
            queue.items.unshift(temp!);

            /** Create a new embed for the shuffled queue */
            embed = await createEmbed(queue.items, { page: currentPage });

            /** Change button states and reset after 5 seconds */
            messageActions = await createMessageButtons('shuffle', queue.length);

            interaction.editReply({ embeds: [embed], components: [messageActions] });
            setTimeout(async () => {
                messageActions = await createMessageButtons('default', queue.length);
                interaction.editReply({ embeds: [embed], components: [messageActions] });
            }, 5000);
            break;

        /** User clicks forward */
        case 'forward':
            currentPage++;
            /** Create a new embed for the next page */
            console.log(currentPage);
            messageActions = await createMessageButtons('default', queue.length);
            createEmbed(queue.items, { page: currentPage }).then(embed => interaction.editReply({ embeds: [embed], components: [messageActions] }));
            break;

        /** User clicks back */
        case 'back':
            currentPage--;
            console.log(currentPage);
            messageActions = await createMessageButtons('default', queue.length);
            createEmbed(queue.items, { page: currentPage }).then(embed => interaction.editReply({ embeds: [embed], components: [messageActions] }));
            break;

        default: break;
    }
}

const slashCommand = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('View and change the music queue')
    .addSubcommand(sub =>
        sub.setName('view')
            .setDescription('View the current queue'))
    .addSubcommand(sub =>
        sub.setName('remove')
            .setDescription('Removes items from the queue')
            .addIntegerOption(option =>
                option.setName('item')
                    .setDescription('# in the queue to remove, if not supplied, first item will be removed')
                    .setRequired(false)))
    .addSubcommand(sub =>
        sub.setName('clear')
            .setDescription('Removes all items from the queue'))
    .addSubcommand(sub =>
        sub.setName('shuffle')
            .setDescription('Shuffles the queue'));

module.exports = {
    data: slashCommand,
    category: 'Music',
    async execute(interaction: CommandInteraction) {
        const client: Client<true, any> = interaction.client,
            queue = client.musicQueueManager.get(interaction.guildId);

        if (!queue || !queue.length) return interaction.reply('There are no items in the music queue.');

        /** Subcommand Handling */
        switch (interaction.options.getSubcommand()) {
            case 'view':

                let embed = await createEmbed(queue.items),
                    messageActions = await createMessageButtons('default', queue.length);
                /** Reply with embed and buttons */
                return interaction.reply({ embeds: [embed], components: [messageActions], fetchReply: true }).then(reply => {
                    if (reply instanceof Message && queue) {

                        let messageCollector = reply.createMessageComponentCollector({ componentType: "BUTTON", time: 5 * 60 * 1000 });
                        /** handleQueueInteraction - handle button clicks */
                        messageCollector.on('collect', async i => {
                            handleQueueInteraction(i, interaction, queue!)
                        });
                    }
                });

            case 'remove':
                let index = interaction.options.getInteger('position');
                queue.remove(index).then(song => {
                    return interaction.reply(`Removed ${song}`);
                }).catch(err => {
                    return interaction.reply(err);
                });

            default: break;
        }
    },
};

const skipSong = async (interaction: CommandInteraction, queue: MusicQueue) => {
    let connection = getVoiceConnection(interaction.guildId!);
    interaction.client.logger.log({
        level: 'info',
        label: 'main',
        message: `Skipping: ${queue!.items[0].match.title}${(queue!.items[1]) ? '\nNext song: ' + queue!.items[1].match.title : ''}`
    });

    interaction.client.audioPlayers.get(interaction.guildId!)!.player!.stop(true);
    queue.items.shift();

    if (connection) {
        getVolume(interaction.guildId).then(volume =>
            playQueue(connection!, queue, volume))
    }


}

