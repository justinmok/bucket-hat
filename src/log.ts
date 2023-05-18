import winston = require('winston');
import DailyRotateFile from 'winston-daily-rotate-file';

const format = (info: winston.Logform.TransformableInfo): string => {
    let label = info.label ?? 'main';
    return `${info.timestamp} - [${info.level}] [${label}] ${info.message}`;
};

const rotateFileOpts = {
    frequency: '#24h',
    dirname: '../logs',
    filename: 'buckethat_%DATE%.log',
};

const consoleOpts = {
    level: process.env.NODE_ENV == 'dev' ? 'debug' : 'info',
};

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.printf((info) => format(info))
    ),
    transports: [
        new winston.transports.Console(consoleOpts),
        new DailyRotateFile(rotateFileOpts),
    ],
});

export { logger };
