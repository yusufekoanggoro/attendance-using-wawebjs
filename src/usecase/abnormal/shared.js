const moment = require('moment');
const fileUtils = require('../../lib/utils/file');
const wrapper = require('../../lib/utils/wrapper');
const CSVHandler = require('../../lib/csv');

const checkBaseFoldeExists = async (groupName, additionalPath = '') => {
  try {
    let baseFolder = `./data/${groupName}`;
    if(additionalPath.length) baseFolder = baseFolder + '/' + additionalPath;

    const checkBaseFolderExists = await fileUtils.checkFileExists(baseFolder);
    if (!checkBaseFolderExists) {
      await fileUtils.createDirectory(baseFolder);
    }
    return wrapper.data(baseFolder);
  } catch (error) {
    return wrapper.error(error);
  }
};

const getFilePathPresence = async (groupInfo, withCreate = false) => {
  try {
    const {
      id: groupId,
      name: groupName,
    } = groupInfo;

    const date = moment().format('DD-MM-YYYY');
    const filePath = `./data/${groupName}/${date}/mkn-${groupId}-attendancerecord.csv`;

    if(withCreate){
      await checkBaseFoldeExists(groupName, date);
  
      const checkFileExists = await fileUtils.checkFileExists(filePath);
      if (!checkFileExists) {
        await fileUtils.createFile(filePath, 'wa_number,npm,full_name\n');
      }
    }

    if(!await fileUtils.checkFileExists(filePath)){
      return wrapper.error('file not found');
    }

    return wrapper.data(filePath);
  } catch (error) {
    return wrapper.error(error);
  }
};

const getFilePathUserMasterSpesific = async (groupInfo) => {
  try {
    const {
      id: groupId,
      name: groupName,
    } = groupInfo;

    await checkBaseFoldeExists(groupName);

    const filePathUserMaster = `./data/${groupName}/${groupId}-users.csv`;
    const checkFileExists = await fileUtils.checkFileExists(filePathUserMaster);
    if (!checkFileExists) await fileUtils.createFile(filePathUserMaster, 'wa_number,npm,full_name\n');

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

const checkFilePathPresenceExist = async (groupInfo) => {
  try {
    const {
      id: groupId,
      name: groupName,
    } = groupInfo;

    const date = moment().format('DD-MM-YYYY');
    const filePath = `./data/${groupName}/${date}/mkn-${groupId}-attendancerecord.csv`;

    const checkFileExists = await fileUtils.checkFileExists(filePath);
    if (!checkFileExists) {
      return wrapper.error('file not found');
    }

    return wrapper.data(filePath);
  } catch (error) {
    return wrapper.error(error);
  }
};

const getPresence = async (groupInfo) => {
  try {

    const filePathUserMaster = await getFilePathUserMaster(groupInfo);
    const filePathPresence = await getFilePathPresence(groupInfo);

    const headerMessage = await getHeaderMessage(groupInfo.name);
    if (headerMessage.err) return headerMessage;

    if (!filePathUserMaster.err && !filePathPresence.err) {
      const csvHandler = new CSVHandler(filePathPresence.data);
      const presenceData = await csvHandler.readAllRecords();
      if (presenceData.err) return wrapper.error('data not found');

      const newAttendanceData = [];
      let sequenceNumber = 1;

      const csvUserMaster = new CSVHandler(filePathUserMaster.data);
      for (const data of presenceData.data) {
        const findUserByWaNumber = await csvUserMaster.findOneByField('wa_number', data.wa_number);

        let name = '';
        let npm = '';
        if (!findUserByWaNumber.err) {
          name = findUserByWaNumber.data.full_name;
          npm = findUserByWaNumber.data.npm;
          newAttendanceData.push(`${sequenceNumber}. ${npm} ${name}\n`);
          sequenceNumber += 1;
        }
      }

      let finalString = `${headerMessage.data}\n\n`;
      newAttendanceData.forEach((v) => {
        finalString += v;
      });

      finalString += `\nTotal: ${newAttendanceData.length} Mahasiswa/i`;
      return wrapper.data(finalString);
    }

    let finalString = `${headerMessage.data}\n\n\nTotal: 0 Mahasiswa/i`;

    return wrapper.data(finalString);
  } catch (error) {
    return wrapper.error(error);
  }
};

const getFilePathUserMaster = async () => {
  try {

    const baseFolder = './data';
    const checkBaseFolderExists = await fileUtils.checkFileExists(baseFolder);
    if (!checkBaseFolderExists) {
      await fileUtils.createDirectory(baseFolder);
    }

    const filePathUserMaster = `./data/users.csv`;
    const checkFileExists = await fileUtils.checkFileExists(filePathUserMaster);
    if (!checkFileExists) await fileUtils.createFile(filePathUserMaster, 'wa_number,npm,full_name\n');

    return wrapper.data(filePathUserMaster);
  } catch (error) {
    return wrapper.error(error);
  }
};

module.exports = {
  checkBaseFoldeExists,
  getFilePathPresence,
  getFilePathUserMaster,
  getHeaderMessage,
  checkFilePathPresenceExist,
  getPresence,
  getFilePathUserMasterSpesific
};
