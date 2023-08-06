const moment = require('moment');
const wrapper = require('../../lib/utils/wrapper');
const CSVHandler = require('../../lib/csv');
const fileUtils = require('../../lib/utils/file');

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
    let filePath;

    const {
      id: groupId,
      name: groupName,
    } = groupInfo;

    filePath = `./data/mkn-${groupName}-${groupId}-attendancerecord-${moment().format('DD.MM.YYYY')}.csv`;

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