import winston = require('winston');
import DailyRotateFile from 'winston-daily-rotate-file';

const format = winston.format((info, opts) => {

    return info;
});

const rotateFileOpts = {
    frequency: '#24h',
    dirname: '../logs',
    filename: 'buckethat_%DATE%.log'
};

const logger = winston.createLogger({
    format: winston.format.combine(winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }), winston.format.printf(info =>
        `${info.timestamp} - [${info.label ? info.label : 'main'} ${info.level}] ${info.message}`)),
    transports: [
        new winston.transports.Console(),
        new DailyRotateFile(rotateFileOpts),
    ]
});

export { logger };