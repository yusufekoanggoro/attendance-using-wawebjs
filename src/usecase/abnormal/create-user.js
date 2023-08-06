const wrapper = require('../../lib/utils/wrapper');
const CSVHandler = require('../../lib/csv');
const stringUtils = require('../../lib/utils/string');
const arrayUtils = require('../../lib/utils/array');
const sharedUc = require('./shared');

const createUser = async (payload) => {
  try {
    const {
      msg,
      groupInfo,
      userInfo,
    } = payload;

    const {
      id: userId,
    } = userInfo;

    const conditions = [];
    const msgBody = msg.body.trim();

    if (msgBody.split(' ', 3).length === 3) {
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

      if (await arrayUtils.allAreTrue(conditions)) {
        const filePathUserMaster = await sharedUc.getFilePathUserMaster(groupInfo);
        if (!filePathUserMaster.err) {
          const csvHandler = new CSVHandler(filePathUserMaster.data);

          const findUserByWaNumber = await csvHandler.findOneByField('wa_number', userId);
          const findUserByNpm = await csvHandler.findOneByField('npm', npm);
          if (findUserByWaNumber.err && findUserByNpm.err) {
            const newRecord = {
              wa_number: userId,
              npm,
              full_name: fullName,
            };

            csvHandler.createRecord(newRecord);
            const writeData = await csvHandler.writeData();
            if (writeData.err) return writeData;

            return wrapper.data('berhasil daftar, silahkan ketik .presensi');
          }

          return wrapper.error('pengguna atau npm sudah terdaftar');
        }

        return wrapper.error('file not found');
      }
    }

    return wrapper.error('Format pesan salah');
  } catch (error) {
    return wrapper.error(error);
  }
};

module.exports = createUser;
