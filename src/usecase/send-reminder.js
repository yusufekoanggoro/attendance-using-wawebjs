const moment = require('moment');
const wrapper = require('../lib/utils/wrapper');
const CSVHandler = require('../lib/csv');
const fileUtils = require('../lib/utils/file');

const checkBaseFoldeExists = async () => {
  try {
    const baseFolder = './data';
    const checkBaseFolderExists = await fileUtils.checkFileExists(baseFolder);
    if (!checkBaseFolderExists) {
      await fileUtils.createDirectory(baseFolder);
    }
    return baseFolder;
  } catch (error) {
    return false;
  }
};

const getFilePathUserMaster = async (groupInfo) => {
  try {
    const {
      id: groupId,
      name: groupName,
    } = groupInfo;
    
    await checkBaseFoldeExists();

    const filePathUserMaster = `./data/${groupId}-${groupName}-users.csv`;
    const checkFileExists = await fileUtils.checkFileExists(filePathUserMaster);
    if(!checkFileExists) await fileUtils.createFile(filePathUserMaster, 'wa_number,npm,full_name\n');

    return filePathUserMaster;
  } catch (error) {
    return '';
  }
};

const getFilePathPresence = async (groupInfo) => {
  try {
    const currentDate = moment();
    let filePath;

    const startDate1 = moment().set({
      hour: 18,
      minute: 30,
      second: 0,
    });
    const endDate1 = moment().set({
      hour: 20,
      minute: 10,
      second: 0,
    });
    const startDate2 = moment().set({
      hour: 7,
      minute: 30,
      second: 0,
    });
    const endDate2 = moment().set({
      hour: 10,
      minute: 0,
      second: 0,
    });
    const startDate3 = moment().set({
      hour: 10,
      minute: 0,
      second: 0,
    });
    const endDate3 = moment().set({
      hour: 11,
      minute: 40,
      second: 0,
    });
    const startDate4 = moment().set({
      hour: 12,
      minute: 30,
      second: 0,
    });
    const endDate4 = moment().set({
      hour: 14,
      minute: 10,
      second: 0,
    });

    const {
      id: groupId,
      name: groupName,
    } = groupInfo;

    let validations = [];

    validations.push(currentDate.day() === 5)
    if (currentDate >= startDate1 && currentDate <= endDate1 && validations.includes(true)) {
      filePath = `./data/mk1.${groupName}-${groupId}-attendancerecord-${moment().format('DD.MM.YYYY')}.csv`;
    } 
    
    validations = [];
    validations.push(currentDate.day() === 6, currentDate.day() === 0)
    if (currentDate >= startDate2 && currentDate <= endDate2 && validations.includes(true)) {
      filePath = `./data/mk2.${groupName}-${groupId}-attendancerecord-${moment().format('DD.MM.YYYY')}.csv`;
    } else if (currentDate >= startDate3 && currentDate <= endDate3 && validations.includes(true)) {
      filePath = `./data/mk3.${groupName}-${groupId}-attendancerecord-${moment().format('DD.MM.YYYY')}.csv`;
    } else if (currentDate >= startDate4 && currentDate <= endDate4 && validations.includes(true)) {
      filePath = `./data/mk4.${groupName}-${groupId}-attendancerecord-${moment().format('DD.MM.YYYY')}.csv`;
    } else {
      filePath = `./data/mkn-${groupName}-${groupId}-attendancerecord-${moment().format('DD.MM.YYYY')}.csv`;
      return wrapper.error("waktu telah berakhir");
    }

    await checkBaseFoldeExists();

    const checkFileExists = await fileUtils.checkFileExists(filePath);
    if (!checkFileExists) {
      await fileUtils.createFile(filePath, 'wa_number,npm,full_name\n');
    }

    return wrapper.data(filePath);
  } catch (error) {
    return wrapper.error(error);
  }
};

const getPresence = async (groupInfo) => {
  try {
    const filePath = await getFilePathPresence(groupInfo);
    if(filePath.err) return filePath;

    const csvHandler = new CSVHandler(filePath.data);
    const presenceData = await csvHandler.readAllRecords();
    if(presenceData.err) return presenceData;

    const usersPresent = [];
    presenceData.data.forEach((data) => {
      usersPresent.push(data.wa_number);
    });

    return wrapper.data(usersPresent);
  } catch (error) {
    return wrapper.error(error);
  }
};

const sendReminder = async (payload) => {
  try {
    const { client } = payload;
    const { chat } = payload;

    const filePathUserMaster = await getFilePathUserMaster(payload.groupInfo);
    if(filePathUserMaster){
      const presenceData = await getPresence(payload.groupInfo);
      if (presenceData.err) return presenceData;
  
      const usersPresent = presenceData.data;
  
      const mentions = [];
  
      const csvHandler = new CSVHandler(filePathUserMaster);
      const usersRecord = await csvHandler.readAllRecords();
      if (usersRecord.err) return usersRecord;
  
      let textMentionsUser = '';
      for (const participant of chat.participants) {
        const contact = await client.getContactById(participant.id._serialized);
        if (!usersPresent.includes(participant.id._serialized)) {
          const foundUser = usersRecord.data.filter((v) => v.wa_number === participant.id._serialized);
          if (foundUser.length) {
            mentions.push(contact);
            textMentionsUser += `@${participant.id.user} `;
          }
        }
      }
  
      const data = {
        mentions,
        textMentionsUser,
        usersPresent,
      };
      return wrapper.data(data);
    }

    return wrapper.error('file not found');
  } catch (error) {
    return wrapper.error(error);
  }
};

module.exports = sendReminder;
