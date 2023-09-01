const newEventHandler = require('./delivery/new-event-handler');
const logger = require('./lib/logger');
const timeUtils = require('./lib/utils/time');
const whatsAppWebClient = require('./lib/whatsappwebclient');

(async () => {
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

  const setClassHours = async () => {
    const defaultClassHours = [{
      name: 'mk1',
      startTime: '18:30:00',
      endTime: '20:10:00',
      inDays: [5],
    },
    {
      name: 'mk2',
      startTime: '07:30:00',
      endTime: '10:00:00',
      inDays: [6, 0],
    },
    {
      name: 'mk3',
      startTime: '10:00:00',
      endTime: '11:00:00',
      inDays: [6, 0],
    },
    {
      name: 'mk4',
      startTime: '12:30:00',
      endTime: '14:10:00',
      inDays: [6, 0],
    },
      // {
      //   name: 'mk5',
      //   startTime: '14:10:00',
      //   endTime: '18:00:00',
      //   inDays: [0, 1, 2, 3, 4, 5, 6]
      // }
    ];

    const userInput = await askQuestion('apakah ingin ubah waktu kuliah? (y/t): ');
    if (userInput.toLowerCase() !== 't') {
      for (const [index, classHour] of defaultClassHours.entries()) {
        const select = await askQuestion(`mau ubah ${classHour.name}? (y/t): `);
        if (select.toLowerCase() !== 't') {
          let startTime = await askQuestion('input waktu mulai: HH:mm:ss ');

          const validStartTime = timeUtils.validateTimeString(startTime);
          while (!validStartTime) {
            logger.error('format salah');
            startTime = await askQuestion('input waktu mulai: HH:mm:ss ');
          }

          let endTime = await askQuestion('input waktu berakhir: HH:mm:ss ');
          const validEndTime = timeUtils.validateTimeString(endTime);
          while (!validEndTime) {
            logger.error('format salah');
            endTime = await askQuestion('input waktu mulai: HH:mm:ss ');
          }

          defaultClassHours[index].startTime = startTime;
          defaultClassHours[index].endTime = endTime;
        }
      }
    }
    return defaultClassHours;
  };

  const gracefulShutdown = async () => {
    try {
      logger.info('Received shutdown signal. Initiating graceful shutdown...');
      await whatsAppWebClient.shutdown();
    } catch (error) {
      logger.error('Error during cleanup:', error);
    }
  };

  try {
    const classHours = await setClassHours();

    const freeMode = await askQuestion('apakah ingin menggunakan mode bebas? (y/t): ');
    const isFreeMode = freeMode.toLowerCase() !== 't';

    whatsAppWebClient.start();
    whatsAppWebClient.handleIncomingMessage(
      newEventHandler.onMessage,
      { classHours, isFreeMode },
    );

    process.on('SIGINT', async () => {
      await gracefulShutdown();
    });
  } catch (error) {
    logger.error(error);
  }
})();
