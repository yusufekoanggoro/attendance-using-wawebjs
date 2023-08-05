const moment = require('moment');
const wrapper = require('../lib/utils/wrapper');
const CSVHandler = require('../lib/csv');
const fileUtils = require('../lib/utils/file');
const logger = require('../lib/logger');

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

    if (currentDate >= startDate1 && currentDate <= endDate1 && currentDate.day() === 5) {
      filePath = `./data/mk1.${groupName}-${groupId}-attendancerecord-${moment().format('DD.MM.YYYY')}.csv`;
    } else if (currentDate >= startDate2 && currentDate <= endDate2 && currentDate.day() === 6) {
      filePath = `./data/mk2.${groupName}-${groupId}-attendancerecord-${moment().format('DD.MM.YYYY')}.csv`;
    } else if (currentDate >= startDate3 && currentDate <= endDate3 && currentDate.day() === 6) {
      filePath = `./data/mk3.${groupName}-${groupId}-attendancerecord-${moment().format('DD.MM.YYYY')}.csv`;
    } else if (currentDate >= startDate4 && currentDate <= endDate4 && currentDate.day() === 6) {
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

    let header = `Presensi ${currentDate.format('DD-MM-YYYY')}
${groupName}
-`;

    if (
      currentDate >= startDate1 
      && currentDate <= endDate1
      && currentDate.day() === 5
      ) {
      header = `Presensi ${currentDate.format('DD-MM-YYYY')}
${groupName}
(Pukul ${startDate1.format('HH:mm')} - ${endDate1.format('HH:mm')})`;
    }

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
    if (currentDate >= startDate2 && currentDate <= endDate2) {
      header = `Presensi ${currentDate.format('DD-MM-YYYY')}
${groupName}
(Pukul ${startDate1.format('HH:mm')} - ${endDate1.format('HH:mm')})`;
    }

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
    if (currentDate >= startDate3 && currentDate <= endDate3) {
      header = `Presensi ${currentDate.format('DD-MM-YYYY')}
${groupName}
(Pukul ${startDate2.format('HH:mm')} - ${endDate2.format('HH:mm')})`;
    }

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
    if (currentDate >= startDate4 && currentDate <= endDate4) {
      header = `Presensi ${currentDate.format('DD-MM-YYYY')}
${groupName}
(Pukul ${startDate4.format('HH:mm')} - ${endDate4.format('HH:mm')})`;
    }

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
