const dialogFlow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

async function replyMsg(msg, session, projectID) {
    const sessionClient = new dialogFlow.SessionsClient();
    const sessionPath = await sessionClient.projectAgentSessionPath(projectID, session);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: msg,
                languageCode: 'en-US',
            },
        },
    };

    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    return await result.fulfillmentText;
}

module.exports = {
    name: 'ai',
    category: 'Experimental',
    description: 'Start a conversation with a Google-provided AI',
    usage: 'ai start',
    execute(message, args) {
        if (!args.length) return;
        if (!(args[0].includes('start'))) return;
        message.reply('are you sure you want to talk to the AI?').then((msg) => {
            const filter = msg => /^(yes)|(^no)|^(ya)|^(nope)|(^y$)|(^n$)/gi.test(msg.content);
            
            let confirmCollector = msg.channel.createMessageCollector(filter, { max: 1, time: 30000 });

            confirmCollector.on('collect', msg => {
                if (/^(yes)|^(ya)|(^y$)/gi.test(msg.content)) {
                    msg.channel.send('Got it! 👍 Start by asking "What is your name?" The session should automatically end after 5 minutes of inactivity.');
                    confirmCollector.stop('confirmed');
                } else return;
            });

            confirmCollector.on('end', (collected, reason) => {
                if (!(reason.includes('confirmed'))) {
                    message.channel.send('Cancelled due to timeout');
                    return;
                }

                const sessionID = uuid.v4();
                let cloudProjectID = message.client.cloudProjectID;
                let isAuthor = m => m.author.id == message.author.id;

                let dialogCollector = msg.channel.createMessageCollector(isAuthor, { idle: 300000});

                dialogCollector.on('collect', msg => {
                    replyMsg(msg, sessionID, cloudProjectID).then((res) => message.channel.send(res)); 
                });

                dialogCollector.on('end', () => {
                    message.channel.send('Session ended.');
                    return;
                });
            });
        });
    }
};