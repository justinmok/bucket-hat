import { CommandInteraction } from "discord.js";

module.exports = {
    name: 'eval',
    category: 'Admin',
    description: 'Evaluates Javascript expressions',
    options: [{
        type: 'STRING',
        name: 'expression',
        description: 'The Javascript expression to run',
        required: true
    }],
    execute(interaction: CommandInteraction) {
        try {
            let expression = interaction.options[0].value as string;
            let evaled = require('util').inspect(eval(expression));
            interaction.reply(`\`\`\`js\n${evaled}\`\`\``);
        } catch (error) {
            interaction.reply(`An error occured when evaluating expression: \`\`\`\n${error}\`\`\``);
        }
    }
};