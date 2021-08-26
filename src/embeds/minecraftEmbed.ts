import { MessageAttachment, MessageEmbed } from "discord.js";
import type { MinecraftResponse } from "../../typings";

export const createEmbed = (response: MinecraftResponse): Promise<MessageEmbed> => {
    return new Promise<MessageEmbed>((resolve, reject) => {
        let embed = new MessageEmbed()
        .setColor('#dddddd')
        .setTitle('Query Result')
        .setTimestamp()
        .addField('Version', response.version.name)
        .addField('MOTD/Description', response.description.text ?? response.description)
        .addField('Ping', `${response.ping}ms`, true)
        .addField('Players Online', `${response.players.online} / ${response.players.max}`, true)
        .setFooter('Bucket Hat Bot', 'https://cdn.discordapp.com/avatars/783886978974220338/9e5abce14cce133de8c6145e556ee725.png?size=32');
    
        if (!response.favicon) resolve(embed.setThumbnail('https://packpng.com/static/pack.png'))
        else {
            let imageBuffer = Buffer.from(response.favicon!, 'base64');
            let attachment = new MessageAttachment(Buffer.from(imageBuffer), 'favicon.png');
            resolve(embed.setThumbnail('attachment://favicon.png'));
        }
    });
}

export const getAttachment = (favicon: string): Promise<MessageAttachment> => {
    return new Promise<MessageAttachment>((resolve, reject) => { 
        let imageBuffer = Buffer.from(favicon, 'base64');
        let attachment = new MessageAttachment(Buffer.from(imageBuffer), 'favicon.png');
        resolve(attachment);
    });
}