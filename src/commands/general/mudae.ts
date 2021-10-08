import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";
import { addWish, fetchWishes, MudaeWish } from "../utils/mudaeUtils";

/* todo: in d.js v13.3, replace remove string option with autocomplete */
const slashCommand = new SlashCommandBuilder()
    .setName('mudae')
    .setDescription('(Hopefully) Useful commands for Mudae Bot')
    .addSubcommandGroup(sub =>
        sub.setName('wishlist')
        .setDescription('Wishlist related utilites')
        .addSubcommand(subcmd =>
            subcmd.setName('view')
            .setDescription('Displays your wishlist')
            .addUserOption(option =>
                option.setName('user')
                .setDescription('Displays the wishlist of another user')
                .setRequired(false)
            )
        )
        .addSubcommand(subcmd =>
            subcmd.setName('add')
            .setDescription('Adds an item to your wishlist')
            .addStringOption(option =>
                option.setName('type')
                .setDescription('type')
                .addChoice('Character', 'char')
                .addChoice('Series', 'char')
                .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('addname')
                .setDescription('Name of the character/series to add')
                .setRequired(true)
            )
        )
        .addSubcommand(subcmd =>
            subcmd.setName('remove')
            .setDescription('Removes an item from your wishlist')
            .addStringOption(option =>
                option.setName('removename')
                .setDescription('Name of the character/series to remove')
                .setRequired(true)
            )
       )
       .addSubcommand(subcmd =>
            subcmd.setName('changeowned')
            .setDescription('Change an item\'s ownership status.')
            .addStringOption(option =>
                option.setName('name')
                .setDescription('Name of the character/series to edit')
            )
        )
    )

module.exports = {
    data: slashCommand,
    category: 'General',
    async execute(interaction: CommandInteraction) {
        //interaction.deferReply();
        let subcommand = interaction.options.getSubcommand();
        switch(subcommand) {
            case 'view': {
                let userId = interaction.user.id;
                fetchWishes(interaction.guildId!, userId).then(wishes => {
                    console.log(wishes);
                    if (!wishes.length) interaction.reply('No wishes found.');
                    else interaction.reply(`${wishes.map(wish => wish.name) + ', '}`);
                })


                break;
            }
            case 'add': {
                let userId = interaction.user.id;
                let name = interaction.options.getString('addname')!;
                let type = <'char' | 'series'>interaction.options.getString('type');
                let wish = ({ name, type, isClaimed: false, userId });
                addWish(interaction.guildId!, wish).then(() =>
                    interaction.reply(`Added ${wish.name}`)
                );
                break;
            }
            case 'remove':



                break;
            case 'changeowned': {

                break;
            }
            default:
                break;
        }
    }
}