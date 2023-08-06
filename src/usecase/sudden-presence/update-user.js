const wrapper = require('../../lib/utils/wrapper');
const CSVHandler = require('../../lib/csv');
const fileUtils = require('../../lib/utils/file');
const stringUtils = require('../../lib/utils/string');
const arrayUtils = require('../../lib/utils/array');
const logger = require('../../lib/logger');
const moment = require('moment');

const checkBaseFoldeExists = async () => {
  try {
    const baseFolder = './data';
    const checkBaseFolderExists = await fileUtils.checkFileExists(baseFolder);
    if (!checkBaseFolderExists) {
      await fileUtils.createDirectory(baseFolder);
    }
    return baseFolder;
  } catch (error) {
    return false;
  }
};

const getFilePathUserMaster = async (groupInfo) => {
    try {
      const {
        id: groupId,
        name: groupName,
      } = groupInfo;
      
      await checkBaseFoldeExists();
  
      const filePathUserMaster = `./data/${groupId}-${groupName}-users.csv`;
      const checkFileExists = await fileUtils.checkFileExists(filePathUserMaster);
      if(!checkFileExists) await fileUtils.createFile(filePathUserMaster, 'wa_number,npm,full_name\n');
  
      return wrapper.data(filePathUserMaster);
    } catch (error) {
      return wrapper.error(error);
    }
};

const getFilePathPresence = async (groupInfo) => {
  try {
    let filePath;

    const {
      id: groupId,
      name: groupName,
    } = groupInfo;

    filePath = `./data/mkn-${groupName}-${groupId}-attendancerecord-${moment().format('DD.MM.YYYY')}.csv`;

    await checkBaseFoldeExists();

    const checkFileExists = await fileUtils.checkFileExists(filePath);
    if (!checkFileExists) {
      await fileUtils.createFile(filePath, 'wa_number,npm,full_name\n');
    }

    return wrapper.data(filePath);
  } catch (error) {
    return wrapper.error(error);
  }
};

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
        const filePathUserMaster = await getFilePathUserMaster(groupInfo);
        const filePathPresence = await getFilePathPresence(groupInfo);

        if(!filePathUserMaster.err && !filePathPresence.err){
          const csvHandler = new CSVHandler(filePathUserMaster.data);
  
          const findUserByWaNumber = await csvHandler.findByField('wa_number', userId);
          const findUserByNpm = await csvHandler.findByField('npm', npm);
          if (!findUserByWaNumber.err) {
            if(!findUserByNpm.err) return wrapper.error('npm sudah terdaftar')

            const updateRecord = {
              wa_number: userId,
              npm,
              full_name: fullName,
            };

            const resUpdate = await csvHandler.updateRecordByWaNumber(updateRecord);
            if(resUpdate.err) return resUpdate;

            const writeData = await csvHandler.writeData();
            if (writeData.err) return writeData;

            const csvPresence = new CSVHandler(filePathPresence.data);
            const resUpdatePresence = await csvPresence.updateRecordByWaNumber(updateRecord);
            if(!resUpdatePresence.err){
              const writeData = await csvPresence.writeData();
              if (writeData.err) return writeData;
            }else{
              logger.info(resUpdatePresence.err)
            }
  
            return wrapper.data('berhasil update');
          }
  
          return wrapper.error('pengguna belum terdaftar');
        }

        return wrapper.error('file not found');
      }
    }

    return wrapper.error('Format pesan salah');
  } catch (error) {
    return wrapper.error(error);
  }
};

module.exports = updateUser;