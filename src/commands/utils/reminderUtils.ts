import { Agenda } from 'agenda/es';

const mongoConnectionString = (process.env.NODE_ENV == 'dev') ?
    "mongodb://192.168.1.160/agenda" : 
    "mongodb://mongodb/agenda";

const agenda = new Agenda({ db: { address: mongoConnectionString } });

export class Reminder {
    constructor(params) {
        
    }
}

export const createReminder = (reminder): Promise<Reminder> => {
    return new Promise<Reminder>((resolve, reject) => {
        
    });
}