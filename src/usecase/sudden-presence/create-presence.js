const moment = require('moment');
const wrapper = require('../../lib/utils/wrapper');
const CSVHandler = require('../../lib/csv');
const fileUtils = require('../../lib/utils/file');
const logger = require('../../lib/logger');

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

    return wrapper.data(filePathUserMaster);
  } catch (error) {
    return wrapper.error(error);
  }
};

const getHeaderMessage = async (groupName) => {
  try {
    const currentDate = moment();

    const header = `Presensi ${currentDate.format('DD-MM-YYYY')}
${groupName}`;

    return wrapper.data(header);
  } catch (error) {
    return wrapper.error(error);
  }
};

const getPresence = async (groupInfo) => {
  try {
    const filePathPresence = await getFilePathPresence(groupInfo);
    if(filePathPresence.err) return filePathPresence;

    const csvHandler = new CSVHandler(filePathPresence.data);
    const presenceData = await csvHandler.readAllRecords();
    if(presenceData.err) return presenceData;

    const newAttendanceData = [];
    let sequenceNumber = 1;
    presenceData.data.forEach((data) => {
      newAttendanceData.push(`${sequenceNumber}. ${data.npm} ${data.full_name}\n`);
      sequenceNumber += 1;
    });

    const headerMessage = await getHeaderMessage(groupInfo.name);
    if(headerMessage.err) return headerMessage;

    let finalString = `${headerMessage.data}\n\n`;
    newAttendanceData.forEach((v) => {
      finalString += v;
    });

    return wrapper.data(finalString);
  } catch (error) {
    return wrapper.error(error);
  }
};

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

const createPresence = async (payload) => {
  try {
    const {
      id: userId,
    } = payload.userInfo;

    const filePathUserMaster = await getFilePathUserMaster(payload.groupInfo);
    const filePathPresence = await getFilePathPresence(payload.groupInfo);
    if(filePathPresence.err) return filePathPresence;

    if(!filePathUserMaster.err && !filePathPresence.err){
      const csvUserMaster = new CSVHandler(filePathUserMaster.data);

      const findUser = await csvUserMaster.findByField('wa_number', userId);
      if(findUser.err) return wrapper.error('no wa belum terdaftar');
      
      const npm = findUser.data[0].npm;
      const fullName = findUser.data[0].full_name;

      const csvPresence = new CSVHandler(filePathPresence.data);

      const findUserByNpm = await csvPresence.findByField('npm', npm);
      if(findUserByNpm.err) {
        const newRecord = {
          wa_number: userId,
          npm,
          full_name: fullName,
        };
          
        csvPresence.createRecord(newRecord);
  
        const writeData = await csvPresence.writeData();
        if (writeData.err) return writeData;
      }

      logger.info(`.presensi ${npm} ${fullName}`);

      const presenceData = await getPresence(payload.groupInfo);
      return presenceData;
    }

    return wrapper.error('file not found');
  } catch (error) {
    return wrapper.error(error);
  }
};

module.exports = createPresence;
