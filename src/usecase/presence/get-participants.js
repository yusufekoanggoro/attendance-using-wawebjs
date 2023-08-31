const wrapper = require('../../lib/utils/wrapper');
const CSVHandler = require('../../lib/csv');
const sharedUc = require('./shared');

const getParticipants = async (payload) => {
  try {
    const filePathUserMaster = await sharedUc.getFilePathUserMaster(payload.groupInfo);
    if(filePathUserMaster.err) return wrapper.error('file not found');

    const csvHandler = new CSVHandler(filePathUserMaster.data);
    const userData = await csvHandler.readAllRecords();
    
    let participant = [];
    if (!userData.err) participant = userData.data;

    const newAttendanceData = [];
    let sequenceNumber = 1;
    participant.forEach((data) => {
      newAttendanceData.push(`${sequenceNumber}. ${data.npm} ${data.full_name}\n`);
      sequenceNumber += 1;
    });

    let finalString = `Daftar Peserta\n\n`;
    newAttendanceData.forEach((v) => {
      finalString += v;
    });

    finalString += `\nTotal: ${newAttendanceData.length} Mahasiswa/i`;
    return wrapper.data(finalString);
  } catch (error) {
    return wrapper.error(error);
  }
};

module.exports = getParticipants;
