const wrapper = require('../../lib/utils/wrapper');
const CSVHandler = require('../../lib/csv');
const logger = require('../../lib/logger');
const sharedUc = require('./shared');

const createPresence = async (payload) => {
  try {
    const {
      id: userId,
    } = payload.userInfo;

    const filePathUserMaster = await sharedUc.getFilePathUserMaster(payload.groupInfo);
    const filePathPresence = await sharedUc.getFilePathPresence(payload.groupInfo);
    if (filePathPresence.err) return filePathPresence;

    if (!filePathUserMaster.err) {
      const csvUserMaster = new CSVHandler(filePathUserMaster.data);

      const findUser = await csvUserMaster.findOneByField('wa_number', userId);
      if (findUser.err) return wrapper.error('pengguna belum terdaftar');

      const { npm } = findUser.data;
      const fullName = findUser.data.full_name;

      const csvPresence = new CSVHandler(filePathPresence.data);

      const findUserByNpm = await csvPresence.findOneByField('npm', npm);
      if (findUserByNpm.err) {
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

      const presenceData = await sharedUc.getPresence(payload.groupInfo);
      return presenceData;
    }

    return wrapper.error('file not found');
  } catch (error) {
    return wrapper.error(error);
  }
};

module.exports = createPresence;
