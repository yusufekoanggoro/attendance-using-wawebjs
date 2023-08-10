const whatsappWebClient = require('./lib/whatsapp-web-client');
const eventHandler = require('./delivery/event-handler');
const logger = require('./lib/logger');
const timeUtils = require('./lib/utils/time');
const fileUtils = require('./lib/utils/file');
const fs = require('fs').promises;

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
  let defaultClassHours = [{
      name: 'mk1',
      startTime: '18:30:00',
      endTime: '20:10:00',
      inDays: [5]
    },
    {
      name: 'mk2',
      startTime: '07:30:00',
      endTime: '10:00:00',
      inDays: [2, 6, 0]
    },
    {
      name: 'mk3',
      startTime: '10:00:00',
      endTime: '11:40:00',
      inDays: [6, 0]
    },
    {
      name: 'mk4',
      startTime: '12:30:00',
      endTime: '14:10:00',
      inDays: [6, 0]
    },
    // {
    //   name: 'mk5',
    //   startTime: '14:10:00',
    //   endTime: '18:00:00',
    //   inDays: [0, 1, 2, 3, 4, 5, 6]
    // }
  ]

  const userInput = await askQuestion('apakah ingin ubah waktu kuliah? (y/t): ');
  if (userInput.toLowerCase() === 'y') {
    for (const [index, classHour] of defaultClassHours.entries()) {
      let select = await askQuestion(`mau ubah ${classHour.name}? (y/t): `);
      if (select.toLowerCase() === 'y') {
        let startTime = await askQuestion('input waktu mulai: HH:mm:ss ');

        let validStartTime = timeUtils.validateTimeString(startTime);
        while (!validStartTime) {
          console.log('format salah')
          startTime = await askQuestion('input waktu mulai: HH:mm:ss ');
        }

        let endTime = await askQuestion('input waktu berakhir: HH:mm:ss ');
        let validEndTime = timeUtils.validateTimeString(endTime);
        while (!validEndTime) {
          console.log('format salah')
          endTime = await askQuestion('input waktu mulai: HH:mm:ss ');
        }

        defaultClassHours[index].startTime = startTime;
        defaultClassHours[index].endTime = endTime;
      }
    }
  }
  return defaultClassHours;
}



const gracefulShutdown = async () => {
  try {
    console.log('Received shutdown signal. Initiating graceful shutdown...');

    const checkFileExists = await fileUtils.checkFileExists('./group-actives.txt');
    if (checkFileExists) {
      await fs.unlink('./group-actives.txt');
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

process.on('SIGINT', gracefulShutdown);

(async() => {
  try {
    const classHours = await setClassHours();

    const userInput = await askQuestion('apakah ingin menggunakan mode normal? (y/t): ');
    
    let normalMode = false;
    
    if (userInput.toLowerCase() === 'y') normalMode = true;
    
    const client = await whatsappWebClient(true);

    await eventHandler.onMessage(client, normalMode, classHours);

  } catch (error) {
    logger.error(error);
  }
})()