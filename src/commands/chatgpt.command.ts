import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    Message,
} from 'discord.js';

import { Configuration, OpenAIApi } from 'openai';
import SlashCommand from './Command.js';
import type { ChatCompletionRequestMessage } from 'openai';
import { logger } from '../log.js';

const configuration = new Configuration({
    organization: 'org-WK9JqJAfdoWBonkMmpNSkmLB',
    apiKey: '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',
});
const openai = new OpenAIApi(configuration);

const sendMessage = async (
    messages,
    interaction: ChatInputCommandInteraction,
    msg: Message
) => {
    messages.push({
        role: 'user',
        content: msg.content,
        name: msg.author.username.split(' ')[0],
    });

    interaction.channel.sendTyping();

    logger.log({
        level: 'debug',
        label: 'gpt',
        message: `Generating chat completion with ${messages.length} total messages.`,
    });

    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0,
        max_tokens: 128,
    });

    const data = response.data.choices[0];
    if (data.message && data.finish_reason == 'stop') {
        interaction.followUp(`ChatGPT: ${data.message.content}`);
        messages.push({
            role: 'assistant',
            content: data.message.content,
        });
    } else {
        interaction.followUp(`error: ${data.finish_reason}`);
    }

    return messages;
};

// buttons for exiting session
const button = new ButtonBuilder()
    .setEmoji('✅')
    .setStyle(ButtonStyle.Secondary)
    .setLabel('Finish Chat')
    .setCustomId('exit');

const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

const execute = async (interaction: ChatInputCommandInteraction) => {
    let messages: Array<ChatCompletionRequestMessage> = [
        {
            role: 'system',
            content: 'You are a helpful assistant. Introduce yourself.',
        },
    ];

    const bot = interaction.client;
    console.log('hello test');

    interaction.deferReply();

    // get response
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0,
        max_tokens: 2048,
    });

    // check for valid response and send msg
    const data = response.data.choices[0];
    if (data.message && data.finish_reason == 'stop') {
        interaction.followUp({
            components: [row],
            content: `ChatGPT: ${data.message.content}`,
        });
    } else {
        interaction.followUp(`error: ${data.finish_reason}`);
    }

    /* Collect new messages */
    const filter = (msg: Message) => msg.author.id != bot.user.id;
    const collector = interaction.channel.createMessageCollector({
        filter,
        idle: 5 * 60 * 1000,
    });

    collector.on('collect', async (msg) => {
        interaction.channel.sendTyping();
        messages.push(await sendMessage(messages, interaction, msg));
    });
    // handle stop
    collector.on('end', (_, reason) => {
        if (reason != 'user request')
            interaction.followUp({
                ephemeral: true,
                content: '**Chat has ended after 5 minutes of inactivity**',
            });
        endChatCollector.stop('timeout');
    });

    /* Collect exit button clicks */
    const btnFilter = (i: ButtonInteraction<'cached'>) => i.customId == 'exit';
    const endChatCollector =
        interaction.channel.createMessageComponentCollector({
            filter: btnFilter,
            componentType: ComponentType.Button,
            max: 1,
        });
    endChatCollector.on('collect', (i) => {
        collector.stop('user request');
        i.reply('have a nice day <:catWave:914755574359556096>');
    });
};

const command = new SlashCommand(execute);
command.data
    .setName('chatgpt')
    .setDescription('Start a new chat session with GPT 3.5');

export default command;
