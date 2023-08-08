const whatsappWebClient = require('./lib/whatsapp-web-client');
const eventHandler = require('./delivery/event-handler');
const logger = require('./lib/logger');
const timeUtils = require('./lib/utils/time');
const moment = require('moment');

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

const setClassHours = async() => {
  let defaultClassHours = [
    {
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
    }
  ]

  const userInput = await askQuestion('apakah ingin ubah waktu kuliah? (y/t): ');
  if (userInput.toLowerCase() === 'y') {
    for (const [ index, classHour ] of defaultClassHours.entries()) {
      let select = await askQuestion(`mau ubah ${classHour.name}? (y/t): `);
      if(select.toLowerCase() === 'y'){
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

(async () => {
  try {
    const classHours = await setClassHours();

    const userInput = await askQuestion('apakah ingin menggunakan mode normal? (y/t): ');

    let normalMode = false;

    if (userInput.toLowerCase() === 'y') normalMode = true;

    const client = await whatsappWebClient(true);

    await eventHandler.onMessage(client, normalMode, classHours);
    await eventHandler.onMessageCreate(client, normalMode, classHours);
  } catch (error) {
    logger.error(error);
  }
})();
