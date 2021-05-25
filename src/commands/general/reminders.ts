import type { CommandInteraction } from "discord.js";

module.exports = {
    name: 'remindme',
    category: 'General',
    description: 'Create reminders once or on an interval',
    options: [
        {
            type: 'SUB_COMMAND',
            name: 'list',
            description: 'List all reminders you created',
        },
        {
            type: 'SUB_COMMAND',
            name: 'create',
            description: 'Create a new reminder',
            options: [
                {
                    type: 'string',
                    name: 'interval',
                    choices: [
                        {
                            name: 'Once', value: 'once'
                        },
                        {
                            name: 'Every Day', value: '1d'
                        },
                        {
                            name: 'Every 2 Days', value: '2d'
                        },
                        {
                            name: 'Every Week', value: '1w'
                        }
                    ]
                }
            ]
        }
    
    ],
    execute(interaction: CommandInteraction) {

    }
}