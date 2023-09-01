const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const logger = require('./logger');
const LocalAuth = require('./auth_strategies/local-auth');

class WhatsAppWebClient {
  start() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      // puppeteer: { headless: false } //open browser
      // puppeteer: {headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']}
      // puppeteer: {
      //     authTimeout: 0, // https://github.com/pedroslopez/whatsapp-web.js/issues/935#issuecomment-952867521
      //     qrTimeoutMs: 0,
      //     headless: true,
      //     args: [
      //       '--disable-software-rasterizer',
      //       '--disable-gpu',
      //       '--disable-dev-shm-usage'
      //     ]
      // }
      puppeteer: {
        args: ['--no-sandbox'],
        // args: ['--proxy-server=proxy-server-that-requires-authentication.example.com'],
        headless: true, // is true will open browser
      },
    });

    this.client.on('qr', this.displayQRCode);
    this.client.on('ready', this.onClientReady);
    this.client.initialize();
  }

  displayQRCode(qrCode) {
    qrcode.generate(qrCode, { small: true });
  }

  onClientReady() {
    logger.info('Client is ready!');
  }

  async handleIncomingMessage(eventHandler, additionalData) {
    this.client.on('message', async (msg) => {
      await eventHandler(msg, additionalData);
    });
  }

  async shutdown() {
    if (this.client) {
      await this.client.destroy();
    }
    process.exit(0);
  }
}

module.exports = new WhatsAppWebClient();
