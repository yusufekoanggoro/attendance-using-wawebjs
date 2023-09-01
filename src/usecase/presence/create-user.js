const wrapper = require('../../lib/utils/wrapper');
const CSVHandler = require('../../lib/csv');
const stringUtils = require('../../lib/utils/string');
const arrayUtils = require('../../lib/utils/array');
const sharedUc = require('./shared');
const logger = require('../../lib/logger');

const createUser = async (payload) => {
  try {
    const {
      msg,
      userInfo,
    } = payload;

    const {
      id: userId,
    } = userInfo;

    const conditions = [];
    const msgBody = msg.body.trim();

    if (msgBody.split(' ', 3).length !== 3) return wrapper.error('gagal daftar, format pesan salah');

    const manipulateMsg = msgBody.split(' ');
    manipulateMsg.shift();

    const npm = manipulateMsg.shift();

    const arrMsgFName = manipulateMsg.filter((item) => item.trim() !== '');
    const fullName = stringUtils.capitalizeEachWord(arrMsgFName.join(' '));

    conditions.push(
      stringUtils.containsOnlyNumbers(npm),
      stringUtils.isAlphabetOnlyWithSpace(fullName),
      // npm.length === 12
    );
    if (!arrayUtils.allAreTrue(conditions)) return wrapper.error('gagal daftar, format pesan salah');

    const filePathUserMaster = await sharedUc.getFilePathUserMaster();
    if (filePathUserMaster.err) return wrapper.error('file not found');

    const csvUser = new CSVHandler(filePathUserMaster.data);

    const findUserByWaNumber = await csvUser.findOneByField('wa_number', userId);
    if (!findUserByWaNumber.err) return wrapper.error('gagal daftar, pengguna sudah terdaftar');

    const findUserByNpm = await csvUser.findOneByField('npm', npm);
    if (!findUserByNpm.err) return wrapper.error('gagal daftar, npm sudah terdaftar');

    const newRecord = {
      wa_number: userId,
      npm,
      full_name: fullName,
    };
    csvUser.createRecord(newRecord);
    const writeData = await csvUser.writeData();
    if (writeData.err) return writeData;

    logger.info(`.daftar ${npm} ${fullName}`);
    return wrapper.data('berhasil daftar, silahkan ketik .presensi');
  } catch (error) {
    return wrapper.error(error);
  }
};

module.exports = createUser;
