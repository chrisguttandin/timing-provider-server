#!/usr/bin/env node

import { argv } from 'process';
import { generateUniqueNumber } from 'fast-unique-numbers';
import { WebSocketServer } from 'ws';
import yargs from 'yargs';
import { ICommandLineArguments } from './interfaces';

const commandLineArguments = (<yargs.Argv<ICommandLineArguments>>yargs(argv.slice(2)))
    .help()
    .option('port', {
        default: 2276,
        describe: 'specify the port at which the server will be listening',
        type: 'number'
    })
    .strict().argv;

if (commandLineArguments instanceof Promise) {
    throw new TypeError('The command line arguments are expected to get parsed synchronously.');
}

const { port } = commandLineArguments;
const activeConnections = new Map<number, (message: object) => void>();
const server = new WebSocketServer({ port });

let origin = 0;

server.on('connection', (connection) => {
    const id = generateUniqueNumber(activeConnections);
    const sendMessage = (message: object) => connection.send(JSON.stringify(message));

    activeConnections.set(id, sendMessage);
    sendMessage({ events: [], origin, type: 'init' });

    origin += 1;

    connection.on('message', (message) => {
        const parsedMessage = JSON.parse(message.toString());
        const sendMessageToActiveConnection = activeConnections.get(parsedMessage.client.id);

        if (sendMessageToActiveConnection !== undefined) {
            sendMessageToActiveConnection({ ...parsedMessage, client: { id } });
        }
    });

    connection.on('close', () => activeConnections.delete(id));

    for (const activeConnection of activeConnections) {
        if (activeConnection[0] !== id) {
            const ids = [id, activeConnection[0]].sort();
            const label = ids.join('-');
            const type = 'request';

            if (ids[0] === id) {
                sendMessage({ client: { id: activeConnection[0] }, label, type });
            } else {
                activeConnection[1]({ client: { id }, label, type });
            }
        }
    }
});
