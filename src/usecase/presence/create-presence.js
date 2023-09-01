const wrapper = require('../../lib/utils/wrapper');
const CSVHandler = require('../../lib/csv');
const logger = require('../../lib/logger');
const sharedUc = require('./shared');
const getPresence = require('./get-presence');

const createPresence = async (payload) => {
  try {
    const {
      id: userId,
    } = payload.userInfo;
    const { classHours } = payload;
    const { isFreeMode } = payload;

    if (!isFreeMode) {
      const isTimeOver = await sharedUc.checkTimeOver(classHours);
      if (isTimeOver.err) return isTimeOver;
    }

    const { groupInfo } = payload;
    const filePathUserMaster = await sharedUc.getFilePathUserMaster();
    const withCreate = true;
    const filePathPresence = await sharedUc.getFilePathPresence({
      groupInfo, withCreate, classHours, isFreeMode,
    });

    if (filePathUserMaster.err || filePathPresence.err) return wrapper.error('file not found');

    const csvUser = new CSVHandler(filePathUserMaster.data);

    const findUser = await csvUser.findOneByField('wa_number', userId);
    if (findUser.err) return wrapper.error('gagal presensi, pengguna belum terdaftar');

    const { wa_number } = findUser.data;
    const fullName = findUser.data.full_name;
    const { npm } = findUser.data;

    const csvPresence = new CSVHandler(filePathPresence.data);

    const findPresenceByWaNumber = await csvPresence.findOneByField('wa_number', wa_number);
    if (findPresenceByWaNumber.err) {
      const newRecord = { wa_number: userId };

      csvPresence.createRecord(newRecord);

      const writeData = await csvPresence.writeData();
      if (writeData.err) return writeData;
    }

    logger.info(`.presensi ${npm} ${fullName}`);
    const presenceData = await getPresence(payload);
    return presenceData;
  } catch (error) {
    return wrapper.error(error);
  }
};

module.exports = createPresence;
