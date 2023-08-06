const whatsappWebClient = require('./lib/whatsapp-web-client');
const eventHandler = require('./delivery/event-handler');
const logger = require('./lib/logger');

const askQuestion = async (question) => new Promise((resolve) => {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question(question, (input) => {
    readline.close();
    resolve(input.trim());
  });
});

(async () => {
  try {
    const userInput = await askQuestion('apakah ingin menggunakan mode normal? (y/t): ');

    let normalMode = false;

    if (userInput.toLowerCase() === 'y') normalMode = true;

    const client = await whatsappWebClient(true);

    await eventHandler.onMessage(client, normalMode);
    await eventHandler.onMessageCreate(client, normalMode);
  } catch (error) {
    logger.error(error);
  }
})();
