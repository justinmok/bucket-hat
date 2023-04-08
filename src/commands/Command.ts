import { ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";

type CommandCategory = 'Admin' | 'General' | 'Music' | 'Experimental';
type RequiredPermissions = Array<PermissionsBitField>; 

export class SlashCommand extends SlashCommandBuilder {
    public category: CommandCategory;
    public permissions: RequiredPermissions;
    public interaction: ChatInputCommandInteraction;

    /**
     * Add function to the interaction. Will fail without
     * 
     * @param execute - The command interaction invoked by chat /slash command
     */
    execute: (ChatInputCommandInteraction) => any;
    
    /**
     * Creates a slash command
     * 
     * @param execute - Function to be executed
     */
    constructor(execute: (ChatInputCommandInteraction) => any) {
        super();
        this.execute = execute;
        this.category = 'General';
    }

    /**
     * Sets the permissions
     *
     * @param perms - The permissions - as an array of PermissionsBitField
     * @returns The slash command
     */
    public setPermissions (perms: RequiredPermissions): SlashCommand {
        this.permissions = perms;
        return this;
    }

    /**
     * Sets the name
     *
     * @param category - The name of the category
     * @returns The slash command
     */
    public setCategory (category: CommandCategory): SlashCommand {
        this.category = category;
        return this;
    }

}