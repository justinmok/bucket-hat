import * as Discord from 'discord.js';
import { ChartJSNodeCanvas,  } from 'chartjs-node-canvas';
import type { cryptoInfo } from '../../typings/index'

const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 400, height: 150 }); 
const generateGraph = (info: cryptoInfo): Promise<Buffer> => {
    let changes: Map<number, string> = new Map();
    info.changes.forEach((change, i) => {
        changes.set(i, change);
    });

    let config = {
        type: 'line',
        data: {
            labels: Array.from({length: 24}, (_, i) => i + 1).reverse(),
            
            datasets: [
                {
                    data: info.changes.map(num => Number(num)).reverse(),
                    pointRadius: [...new Array(changes.size - 1).fill(0), 4],
                    pointBackgroundColor: '#ddd',
                    backgroundColor: 'rgba(0,0,0,1)',
                    borderColor: '#ddd'
                }
            ]
        },
        options: {
            elements: {
                line: {
                    tension: 0.25
                },
            },
            scales: {
                y: {
                    grid: {
                        display: false,
                    },
                    ticks: {
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        color: '#ddd',
                    },
                    position: 'right',
                },
                x: {
                    grid: {
                        display: false,
                    },
                    ticks: {
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        color: '#ddd',                    
                    }
                }
            },
            plugins: { 
                legend: {
                    display: false
                }
            }
        }
    }
    return new Promise<Buffer>((resolve, reject) => {
        // @ts-expect-error
        let attachment = chartJSNodeCanvas.renderToBufferSync(config, 'image/png');
        resolve(attachment);
    });
};

module.exports = {
    name: 'cryptoEmbed',
    generateGraph,
    createEmbed(info: cryptoInfo) {
        let change = (parseFloat(info.close) - parseFloat(info.open));
        let percentChange = (parseFloat(info.close) / parseFloat(info.open) - 1) * 100;
        let rise = parseFloat(info.open) < parseFloat(info.close);

        let embed = new Discord.MessageEmbed()
            .setColor('#dddddd')
            .setTitle(`1 ${info.ticker} = ${info.bid} ${info.fiat}`)
            .setThumbnail(`https://github.com/spothq/cryptocurrency-icons/raw/master/128/white/${info.ticker.toLowerCase()}.png`)
            .setTimestamp()
            .setImage('attachment://graph.png')
            .setDescription(`Last reported price on [${info.exchange}](https://www.gemini.com)`)
            .addField('🕛 24 Hour Change', `${(rise) ? '🟢 Up ' : '🔴 Down'} $${change.toFixed(2)} (${percentChange.toFixed(2)}%)`)
            .setFooter('Bucket Hat Bot', 'https://cdn.discordapp.com/avatars/783886978974220338/9e5abce14cce133de8c6145e556ee725.png?size=32')

        
        return new Promise((resolve, reject) => {
            generateGraph(info).then(graph => {
                resolve({ embeds: [embed], files: [graph]})
            });
        });

     
    }
};