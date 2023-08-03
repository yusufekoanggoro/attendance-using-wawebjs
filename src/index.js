const whatsappWebClient = require('./lib/whatsapp-web-client');
const eventHandler = require('./delivery/event-handler');
const logger = require('./lib/logger');

(async () => {
  try {
    const client = await whatsappWebClient(true);

    await eventHandler.onMessage(client);
    await eventHandler.onMessageCreate(client);
  } catch (error) {
    logger.error(error);
  }
})();
