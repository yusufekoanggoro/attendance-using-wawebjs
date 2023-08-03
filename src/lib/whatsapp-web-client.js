const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const LocalAuth = require('./auth_strategies/local-auth');
const logger = require('./logger');

const whatsappWebClient = async (qrcodeTerminal = false) => {
  const client = new Client({
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
      // args: ['--proxy-server=proxy-server-that-requires-authentication.example.com'],
      headless: !!qrcodeTerminal, // open browser
    },
  });

  client.initialize();

  if (qrcodeTerminal) {
    client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
    });
  }

  client.on('ready', () => {
    logger.info('Client is ready!');
  });

  client.on('disconnected', (reason) => {
    logger.info('Client was logged out', reason);
    whatsappWebClient(true);
  });

  return client;
};

module.exports = whatsappWebClient;
