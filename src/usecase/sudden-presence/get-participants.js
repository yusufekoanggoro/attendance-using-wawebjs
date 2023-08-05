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

const getParticipants = async (payload) => {
  try {
    const filePathUserMaster = await getFilePathUserMaster(payload.groupInfo);
    if(filePathUserMaster){
      const csvHandler = new CSVHandler(filePathUserMaster);
      const presenceData = await csvHandler.readAllRecords();
      if (presenceData.err) return presenceData;
  
      const newAttendanceData = [];
      let sequenceNumber = 1;
      presenceData.data.forEach((data) => {
        newAttendanceData.push(`${sequenceNumber}. ${data.npm} ${data.full_name}\n`);
        sequenceNumber += 1;
      });
  
      let finalString = 'Daftar Peserta\n';
      newAttendanceData.forEach((v) => {
        finalString += v;
      });
  
      finalString += `\nTotal: ${newAttendanceData.length} Mahasiswa/i`;
      return wrapper.data(finalString);
    }

    return wrapper.error('file not found');
  } catch (error) {
    return wrapper.error(error);
  }
};

module.exports = getParticipants;
