const moment = require('moment');
const wrapper = require('../../lib/utils/wrapper');
const CSVHandler = require('../../lib/csv');
const fileUtils = require('../../lib/utils/file');

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

    return filePathUserMaster;
  } catch (error) {
    return '';
  }
};

const getPresence = async (groupInfo) => {
  try {
    const filePathUserMaster = await getFilePathUserMaster(groupInfo);
    const filePathPresence = await getFilePathPresence(groupInfo);
    if(filePathPresence.err) return filePathPresence;

    if(filePathUserMaster && !filePathPresence.err){
      const csvHandler = new CSVHandler(filePathPresence.data);
      const presenceData = await csvHandler.readAllRecords();
      if (presenceData.err) return presenceData;

      const newAttendanceData = [];
      let sequenceNumber = 1;
  
      const csvUserMaster = new CSVHandler(filePathUserMaster);
      for (const data of presenceData.data) {
        const findUserByWaNumber = await csvUserMaster.findByField('wa_number', data.wa_number);

        let name = '';
        if(!findUserByWaNumber.err){
          name = findUserByWaNumber.data[0]['full_name'];
        }
        newAttendanceData.push(`${sequenceNumber}. ${data.npm} ${name}\n`);
        sequenceNumber += 1;
      }
  
      const headerMessage = await getHeaderMessage(groupInfo.name);
      if(headerMessage.err) return headerMessage;

      let finalString = `${headerMessage.data}\n\n`;
      newAttendanceData.forEach((v) => {
        finalString += v;
      });
  
      return wrapper.data(finalString);
    }

    return wrapper.error('file not found');
  } catch (error) {
    return wrapper.error(error);
  }
};

module.exports = getPresence;
