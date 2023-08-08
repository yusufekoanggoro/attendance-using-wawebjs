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

const getFilePathPresence = async (params) => {
  try {
    const currentDate = moment();
    let filePath = '';

    const {
      id: groupId,
      name: groupName,
    } = params.groupInfo;
    const withCreate = params.withCreate;
    const classHours = params.classHours;

    const date = moment().format('DD-MM-YYYY');
    for (const classHour of classHours) {
      const startTime = classHour.startTime.split(":");

      let startDate = moment().set({
        hour: parseInt(startTime[0]),
        minute: parseInt(startTime[1]),
        second: parseInt(startTime[2]),
      });

      const endTime = classHour.endTime.split(":");
      let endDate = moment().set({
        hour: parseInt(endTime[0]),
        minute: parseInt(endTime[1]),
        second: parseInt(endTime[2]),
      });

      let validations = [];
      classHour.inDays.forEach( v => {
        validations.push(currentDate.day() === v);
      })

      if (currentDate >= startDate && currentDate <= endDate && validations.includes(true)) {
        filePath = `./data/${groupName}/${date}/${classHour.name}-${groupId}-attendancerecord.csv`;
      }
    }

    if(withCreate && filePath.length){
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

const getPresence = async (params) => {
  try {
    const groupInfo = params.groupInfo;
    const classHours = params.classHours;

    const filePathUserMaster = await getFilePathUserMaster(groupInfo);
    const filePathPresence = await getFilePathPresence({ groupInfo, withCreate: false, classHours });

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

const checkTimeOver = async (classHours) => {
  try {
    const currentDate = moment();

    for (const classHour of classHours) {
      const startTime = classHour.startTime.split(":");

      let startDate = moment().set({
        hour: parseInt(startTime[0]),
        minute: parseInt(startTime[1]),
        second: parseInt(startTime[2]),
      });

      const endTime = classHour.endTime.split(":");
      let endDate = moment().set({
        hour: parseInt(endTime[0]),
        minute: parseInt(endTime[1]),
        second: parseInt(endTime[2]),
      });

      let validations = [];
      classHour.inDays.forEach( v => {
        validations.push(currentDate.day() === v);
      })

      if (currentDate >= startDate && currentDate <= endDate && validations.includes(true)) {
        return wrapper.data('Ok');
      }
    }
    return wrapper.error('waktu telah berakhir');
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
