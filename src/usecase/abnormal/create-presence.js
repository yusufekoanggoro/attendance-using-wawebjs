const wrapper = require('../../lib/utils/wrapper');
const CSVHandler = require('../../lib/csv');
const logger = require('../../lib/logger');
const sharedUc = require('./shared');

const createPresence = async (payload) => {
  try {
    const {
      id: userId,
    } = payload.userInfo;

    const withCreateFolder = true;
    const filePathUserMaster = await sharedUc.getFilePathUserMaster(payload.groupInfo);
    const filePathPresence = await sharedUc.getFilePathPresence(payload.groupInfo, withCreateFolder);

    if (!filePathUserMaster.err && !filePathPresence.err) {
      const csvUserMaster = new CSVHandler(filePathUserMaster.data);

      const findUser = await csvUserMaster.findOneByField('wa_number', userId);
      if (findUser.err) return wrapper.error('gagal presensi, pengguna belum terdaftar');

      const { wa_number } = findUser.data;
      const fullName = findUser.data.full_name;

      const csvPresence = new CSVHandler(filePathPresence.data);

      const findPresenceByWaNumber = await csvPresence.findOneByField('wa_number', wa_number);
      if (findPresenceByWaNumber.err) {
        const newRecord = { wa_number: userId };

        csvPresence.createRecord(newRecord);

        const writeData = await csvPresence.writeData();
        if (writeData.err) return writeData;
      }

      logger.info(`.presensi ${npm} ${fullName}`);

      const presenceData = await sharedUc.getPresence(payload.groupInfo);
      return presenceData;
    }

    return wrapper.error('file not found');
  } catch (error) {
    return wrapper.error(error);
  }
};

module.exports = createPresence;
