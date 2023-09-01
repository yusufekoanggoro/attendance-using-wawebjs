const wrapper = require('../../lib/utils/wrapper');
const CSVHandler = require('../../lib/csv');
const sharedUc = require('./shared');

const getParticipants = async (payload) => {
  try {
    const filePathUserMaster = await sharedUc.getFilePathUserMaster();
    if (filePathUserMaster.err) return wrapper.error('file not found');

    const csvHandler = new CSVHandler(filePathUserMaster.data);
    const userData = await csvHandler.readAllRecords();

    let allRegisteredUser = [];
    if (!userData.err) allRegisteredUser = userData.data;

    const filteredUsers = [];
    for (const participant of payload.chat.participants) {
      const foundUser = allRegisteredUser.filter((v) => v.wa_number === participant.id._serialized);
      if (foundUser.length) {
        filteredUsers.push(foundUser[0]);
      }
    }

    const registeredUserInGrup = [];
    let sequenceNumber = 1;
    filteredUsers.forEach((data) => {
      registeredUserInGrup.push(`${sequenceNumber}. ${data.npm} ${data.full_name}\n`);
      sequenceNumber += 1;
    });

    let finalString = 'Daftar Peserta\n\n';
    registeredUserInGrup.forEach((v) => {
      finalString += v;
    });

    finalString += `\nTotal: ${registeredUserInGrup.length} Mahasiswa/i`;
    return wrapper.data(finalString);
  } catch (error) {
    return wrapper.error(error);
  }
};

module.exports = getParticipants;
