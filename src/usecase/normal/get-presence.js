const wrapper = require('../../lib/utils/wrapper');
const CSVHandler = require('../../lib/csv');
const sharedUc = require('./shared');

const getPresence = async (groupInfo) => {
  try {

    const isTimeOver = await sharedUc.checkTimeOver();
    if(isTimeOver.err) return isTimeOver;

    const filePathUserMaster = await sharedUc.getFilePathUserMaster(groupInfo);
    const filePathPresence = await sharedUc.getFilePathPresence(groupInfo);

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

      const headerMessage = await sharedUc.getHeaderMessage(groupInfo.name);
      if (headerMessage.err) return headerMessage;

      let finalString = `${headerMessage.data}\n\n`;
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

module.exports = getPresence;
