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

    const date = moment().format('DD-MM-YYYY');

    validations.push(currentDate.day() === 5);
    if (currentDate >= startDate1 && currentDate <= endDate1 && validations.includes(true)) {
      filePath = `./data/${groupName}/${date}/mk1.${groupId}-attendancerecord.csv`;
    }

    validations = [];
    validations.push(currentDate.day() === 6, currentDate.day() === 0);
    if (currentDate >= startDate2 && currentDate <= endDate2 && validations.includes(true)) {
      filePath = `./data/${groupName}/${date}/mk2.${groupId}-attendancerecord.csv`;
    } else if (currentDate >= startDate3 && currentDate <= endDate3 && validations.includes(true)) {
      filePath = `./data/${groupName}/${date}/mk3.${groupId}-attendancerecord.csv`;
    } else if (currentDate >= startDate4 && currentDate <= endDate4 && validations.includes(true)) {
      filePath = `./data/${groupName}/${date}/mk4.${groupId}-attendancerecord.csv`;
    } else {
      filePath = `./data/${groupName}/${date}/mkn-${groupId}-attendancerecord.csv`;
      return wrapper.data(filePath);
    }

    await checkBaseFoldeExists(groupName, date);

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

    let validations = [];

    validations.push(currentDate.day() === 5);
    if (
      currentDate >= startDate1
      && currentDate <= endDate1
      && validations.includes(true)
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

    validations = [];
    validations.push(currentDate.day() === 6, currentDate.day() === 7);
    if (currentDate >= startDate2 && currentDate <= endDate2 && validations.includes(true)) {
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

    validations = [];
    validations.push(currentDate.day() === 6, currentDate.day() === 7);
    if (currentDate >= startDate3 && currentDate <= endDate3 && validations.includes(true)) {
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

    validations = [];
    validations.push(currentDate.day() === 6, currentDate.day() === 7);
    if (currentDate >= startDate4 && currentDate <= endDate4 && validations.includes(true)) {
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
    if (filePathPresence.err) return filePathPresence;

    const csvHandler = new CSVHandler(filePathPresence.data);
    const presenceData = await csvHandler.readAllRecords();
    if (presenceData.err) return presenceData;

    const newAttendanceData = [];
    let sequenceNumber = 1;
    presenceData.data.forEach((data) => {
      newAttendanceData.push(`${sequenceNumber}. ${data.npm} ${data.full_name}\n`);
      sequenceNumber += 1;
    });

    const headerMessage = await getHeaderMessage(groupInfo.name);
    if (headerMessage.err) return headerMessage;

    let finalString = `${headerMessage.data}\n\n`;
    newAttendanceData.forEach((v) => {
      finalString += v;
    });

    return wrapper.data(finalString);
  } catch (error) {
    return wrapper.error(error);
  }
};

const checkTimeOver = async () => {
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

    let validations = [];

    validations.push(currentDate.day() === 5);
    if (currentDate >= startDate1 && currentDate <= endDate1 && validations.includes(true)) {
      return wrapper.data('Ok');
    }

    validations = [];
    validations.push(currentDate.day() === 6, currentDate.day() === 0);
    if (currentDate >= startDate2 && currentDate <= endDate2 && validations.includes(true)) {
      return wrapper.data('Ok');
    } else if (currentDate >= startDate3 && currentDate <= endDate3 && validations.includes(true)) {
      return wrapper.data('Ok');
    } else if (currentDate >= startDate4 && currentDate <= endDate4 && validations.includes(true)) {
      return wrapper.data('Ok');
    } else {
      return wrapper.error('waktu telah berakhir');
    }
  } catch (error) {
    return wrapper.error(error);
  }
};

module.exports = {
  checkBaseFoldeExists,
  getFilePathPresence,
  getFilePathUserMaster,
  getHeaderMessage,
  getPresence,
  checkTimeOver
};
