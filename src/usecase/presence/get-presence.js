const wrapper = require('../../lib/utils/wrapper');
const CSVHandler = require('../../lib/csv');
const sharedUc = require('./shared');

const getPresence = async (payload) => {
  try {
    const { classHours } = payload;
    const { isFreeMode } = payload;

    if (!isFreeMode) {
      const isTimeOver = await sharedUc.checkTimeOver(classHours);
      if (isTimeOver.err) return isTimeOver;
    }

    const { groupInfo } = payload;
    const filePathUserMaster = await sharedUc.getFilePathUserMaster();

    const withCreate = false;
    const filePathPresence = await sharedUc.getFilePathPresence({
      groupInfo, withCreate, classHours, isFreeMode,
    });

    const headerMessage = await sharedUc.getHeaderMessage({ groupInfo, classHours, isFreeMode });
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

    const finalString = `${headerMessage.data}\n\n\nTotal: 0 Mahasiswa/i`;

    return wrapper.data(finalString);
  } catch (error) {
    return wrapper.error(error);
  }
};

module.exports = getPresence;
