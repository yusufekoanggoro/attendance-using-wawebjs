const whatsappWebClient = require('./lib/whatsapp-web-client');
const eventHandler = require('./delivery/event-handler');
const logger = require('./lib/logger');
const timeUtils = require('./lib/utils/time');
const fileUtils = require('./lib/utils/file');
const fs = require('fs');


const gracefulShutdown = async () => {
    try {
        console.log('Received shutdown signal. Initiating graceful shutdown...');

        const checkFileExists = await fileUtils.checkFileExists('./group-actives.txt');
        if (checkFileExists) {
            await fs.promises.unlink('./group-actives.txt');
        }

        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`Exiting with code ${0}`);
                process.exit(0); // Terminate the process with the provided exit code
            }, 10 * 1000);
        });
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
}

const readFileToArray = async (filePath) => {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const lines = data.trim().split('\n');
        return lines;
    } catch (error) {
        throw error;
    }
}


(async () => {
    try {

        const client = await whatsappWebClient(true);

        client.on('ready', async () => {
            const checkFileExists = await fileUtils.checkFileExists('./group-actives.txt');
            if (checkFileExists) {
                const groupActives = await readFileToArray('./group-actives.txt');
                groupActives.forEach(v => {
                    client.sendMessage(v, 'Bot status nonaktif');
                })
                await fs.promises.unlink('./group-actives.txt');
            }
        });

    } catch (error) {
        logger.error(error);
    }
})()

process.on('SIGINT', gracefulShutdown);