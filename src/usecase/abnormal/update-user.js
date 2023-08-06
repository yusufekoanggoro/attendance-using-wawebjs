const wrapper = require('../../lib/utils/wrapper');
const CSVHandler = require('../../lib/csv');
const stringUtils = require('../../lib/utils/string');
const arrayUtils = require('../../lib/utils/array');
const logger = require('../../lib/logger');
const sharedUc = require('./shared');

const updateUser = async (payload) => {
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
        const filePathPresence = await sharedUc.getFilePathPresence(groupInfo);
        if(filePathPresence.err) return filePathPresence;

        if (!filePathUserMaster.err) {
          const csvHandler = new CSVHandler(filePathUserMaster.data);

          const findUserByWaNumber = await csvHandler.findOneByField('wa_number', userId);
          if (!findUserByWaNumber.err) {
            const oldNpm = findUserByWaNumber.data.npm;
            const npmInput = npm;

            if (npmInput !== oldNpm) {
              const findUserByNpm = await csvHandler.findOneByField('npm', npm);
              if (!findUserByNpm.err) return wrapper.error('gagal edit, npm sudah terdaftar');
            }

            const updateRecord = {
              wa_number: userId,
              npm,
              full_name: fullName,
            };

            const resUpdate = await csvHandler.updateRecordByWaNumber(updateRecord);
            if (resUpdate.err) return resUpdate;

            const writeData = await csvHandler.writeData();
            if (writeData.err) return writeData;

            return wrapper.data('berhasil update');
          }

          return wrapper.error('gagal edit, pengguna belum terdaftar');
        }

        return wrapper.error('file not found');
      }
    }

    return wrapper.error('gagal edit, format pesan salah');
  } catch (error) {
    return wrapper.error(error);
  }
};

module.exports = updateUser;
