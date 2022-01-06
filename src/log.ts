import winston = require('winston');
import DailyRotateFile from 'winston-daily-rotate-file';

const format = (info: winston.Logform.TransformableInfo): string => {
    info.label ?? 'main';
    /** label padded to always be 5 chars */
    info.label = (info.label + "  ").slice(0, 5);
    return `${info.timestamp} - [${info.label ?? 'main'} ${info.level}] ${info.message}`
}

const rotateFileOpts = {
    frequency: '#24h',
    dirname: '../logs',
    filename: 'buckethat_%DATE%.log'
};

const logger = winston.createLogger({
    format: winston.format.combine(winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }), winston.format.printf(info => format(info))),
    transports: [
        new winston.transports.Console(),
        new DailyRotateFile(rotateFileOpts),
    ]
});

export { logger };