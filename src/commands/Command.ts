import { ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";

type CommandCategory = 'Admin' | 'General' | 'Music' | 'Experimental';
type RequiredPermissions = Array<PermissionsBitField>; 
export default class SlashCommand {
    public data: SlashCommandBuilder;
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
        this.data = new SlashCommandBuilder();
        this.execute = execute;
        this.category = 'General';
    }

    /**
     * Sets the permissions
     *
     * @param perms - The permissions - as an array of PermissionsBitField
     * @returns The slash command
     */
    public setPermissions (perms: RequiredPermissions): SlashCommandBuilder {
        this.permissions = perms;
        return this.data;
    }

    /**
     * Sets the name
     *
     * @param category - The name of the category
     * @returns The slash command
     */
    public setCategory (category: CommandCategory): SlashCommandBuilder {
        this.category = category;
        return this.data;
    }

    public getName = (): string => {
        return this.data.name;
    }

}