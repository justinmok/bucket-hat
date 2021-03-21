const Discord = require('discord.js');

module.exports = {
    name: 'queueEmbed',
    createEmbed(queue) {
        let { thumbnail } = queue[0].info;
        let embed = new Discord.MessageEmbed()
            .setColor('#dddddd')
            .setTitle('Music Queue')
            .setThumbnail(thumbnail)
            .setTimestamp()
            .setFooter('Written by vibrant#0001');
        
        queue.map((queueItem, index) => {
            let { title, requester } = queueItem;
            embed.addField(`#${index+1} ${title}`, `Requested by ${requester.displayName}`);
        });
        return embed;
    }
};