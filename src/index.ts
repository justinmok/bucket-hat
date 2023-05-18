import { interactionHandler } from './events/Events.js';
import { client, clientReadyHandler, initClient } from './client.js';

// todo: initialize client with other options
initClient();

/** Load commands after client initialized */
client.once('ready', clientReadyHandler);

/** Main command handler */
client.on('interactionCreate', interactionHandler);
