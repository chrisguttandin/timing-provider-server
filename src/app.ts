#!/usr/bin/env node

import { generateUniqueNumber } from 'fast-unique-numbers';
import { argv } from 'process';
import ws from 'ws';
import yargs from 'yargs';
import { ICommandLineArguments } from './interfaces';

(async () => {
    const commandLineArguments = (<yargs.Argv<ICommandLineArguments>>yargs(argv.slice(2)))
        .help()
        .option('port', {
            default: 2276,
            describe: 'specify the port at which the server will be listening',
            type: 'number'
        })
        .strict().argv;

    if (commandLineArguments instanceof Promise) {
        throw new Error('The command line arguments are expected to get parsed synchronously.');
    }

    const { port } = commandLineArguments;
    const activeConnections = new Map<number, (message: object) => void>();
    const server = new ws.Server({ port });

    server.on('connection', (connection) => {
        const id = generateUniqueNumber(activeConnections);
        const sendMessage = (message: object) => connection.send(JSON.stringify(message));

        activeConnections.set(id, sendMessage);

        connection.on('message', (message) => {
            const parsedMessage = JSON.parse(message.toString());

            const sendMessageToActiveConnection = activeConnections.get(parsedMessage.client.id);

            if (sendMessageToActiveConnection !== undefined) {
                sendMessageToActiveConnection({ client: { id }, message: parsedMessage.message });
            }
        });

        connection.on('close', () => activeConnections.delete(id));

        for (const activeConnection of activeConnections) {
            if (activeConnection[0] !== id) {
                const label = [id, activeConnection[0]].sort().join('-');
                const type = 'request';

                sendMessage({ message: { isActive: true, label, mask: { client: { id: activeConnection[0] } } }, type });
                activeConnection[1]({ message: { isActive: false, mask: { client: { id } } }, type });
            }
        }
    });
})();
