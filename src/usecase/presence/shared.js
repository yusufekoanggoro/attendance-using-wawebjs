const moment = require('moment');
const fileUtils = require('../../lib/utils/file');
const wrapper = require('../../lib/utils/wrapper');

const getFilePathPresence = async (params) => {
  try {
    const currentDate = moment();
    let filePath = '';

    const {
      id: groupId,
      name: groupName,
    } = params.groupInfo;

    const { withCreate } = params;
    const { classHours } = params;

    const date = moment().format('DD-MM-YYYY');

    if (params.isFreeMode) {
      filePath = `./data/${groupName}/${date}/mkn-${groupId}-attendancerecord.csv`;
    } else {
      for (const classHour of classHours) {
        const startTime = classHour.startTime.split(':');

        const startDate = moment().set({
          hour: parseInt(startTime[0]),
          minute: parseInt(startTime[1]),
          second: parseInt(startTime[2]),
        });

        const endTime = classHour.endTime.split(':');
        const endDate = moment().set({
          hour: parseInt(endTime[0]),
          minute: parseInt(endTime[1]),
          second: parseInt(endTime[2]),
        });

        const validations = [];
        classHour.inDays.forEach((v) => {
          validations.push(currentDate.day() === v);
        });

        if (currentDate >= startDate && currentDate <= endDate && validations.includes(true)) {
          filePath = `./data/${groupName}/${date}/${classHour.name}-${groupId}-attendancerecord.csv`;
        }
      }
    }

    if (withCreate && filePath.length) {
      const baseFolder = `./data/${groupName}/${date}`;
      const isFileExist = await fileUtils.checkFileExists(baseFolder);
      if (!isFileExist) {
        await fileUtils.createDirectory(baseFolder);
      }

      const checkFileExists = await fileUtils.checkFileExists(filePath);
      if (!checkFileExists) {
        await fileUtils.createFile(filePath, 'wa_number,npm,full_name\n');
      }
    }

    if (!await fileUtils.checkFileExists(filePath)) {
      return wrapper.error('file not found');
    }

    return wrapper.data(filePath);
  } catch (error) {
    return wrapper.error(error);
  }
};

const getHeaderMessage = async (params) => {
  try {
    const groupName = params.groupInfo.name;
    const { classHours } = params;
    const currentDate = moment();
    const { isFreeMode } = params;

    let header = '';
    if (isFreeMode) {
      header = `Presensi ${currentDate.format('DD-MM-YYYY')}\n${groupName}`;
    } else {
      for (const classHour of classHours) {
        const startTime = classHour.startTime.split(':');

        const startDate = moment().set({
          hour: parseInt(startTime[0]),
          minute: parseInt(startTime[1]),
          second: parseInt(startTime[2]),
        });

        const endTime = classHour.endTime.split(':');
        const endDate = moment().set({
          hour: parseInt(endTime[0]),
          minute: parseInt(endTime[1]),
          second: parseInt(endTime[2]),
        });

        const validations = [];
        classHour.inDays.forEach((v) => {
          validations.push(currentDate.day() === v);
        });

        if (currentDate >= startDate && currentDate <= endDate && validations.includes(true)) {
          header = `Presensi ${currentDate.format('DD-MM-YYYY')}\n`
            + `${groupName}\n`
            + `(Pukul ${startDate.format('HH:mm')} - ${endDate.format('HH:mm')})`;
        }
      }
    }

    return wrapper.data(header);
  } catch (error) {
    return wrapper.error(error);
  }
};

const checkTimeOver = async (classHours) => {
  try {
    const currentDate = moment();

    for (const classHour of classHours) {
      const startTime = classHour.startTime.split(':');

      const startDate = moment().set({
        hour: parseInt(startTime[0]),
        minute: parseInt(startTime[1]),
        second: parseInt(startTime[2]),
      });

      const endTime = classHour.endTime.split(':');
      const endDate = moment().set({
        hour: parseInt(endTime[0]),
        minute: parseInt(endTime[1]),
        second: parseInt(endTime[2]),
      });

      const validations = [];
      classHour.inDays.forEach((v) => {
        validations.push(currentDate.day() === v);
      });

      if (currentDate >= startDate && currentDate <= endDate && validations.includes(true)) {
        return wrapper.data('Ok');
      }
    }
    return wrapper.error('waktu telah berakhir');
  } catch (error) {
    return wrapper.error(error);
  }
};

const getFilePathUserMaster = async () => {
  try {
    const baseFolder = './data';
    const isFileExist = await fileUtils.checkFileExists(baseFolder);
    if (!isFileExist) {
      await fileUtils.createDirectory(baseFolder);
    }

    const filePathUserMaster = `${baseFolder}/users.csv`;
    const checkFileExists = await fileUtils.checkFileExists(filePathUserMaster);
    if (!checkFileExists) await fileUtils.createFile(filePathUserMaster, 'wa_number,npm,full_name\n');

    return wrapper.data(filePathUserMaster);
  } catch (error) {
    return wrapper.error(error);
  }
};

module.exports = {
  getFilePathPresence,
  getFilePathUserMaster,
  getHeaderMessage,
  checkTimeOver,
};
