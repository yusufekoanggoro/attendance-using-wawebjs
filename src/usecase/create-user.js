const wrapper = require('../lib/utils/wrapper');
const CSVHandler = require('../lib/csv');
const fileUtils = require('../lib/utils/file');
const stringUtils = require('../lib/utils/string');
const arrayUtils = require('../lib/utils/array');

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

    return filePathUserMaster;
  } catch (error) {
    return '';
  }
};

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
        const filePathUserMaster = await getFilePathUserMaster(groupInfo);
        if(filePathUserMaster){
          const csvHandler = new CSVHandler(filePathUserMaster);
  
          const findUserByWaNumber = await csvHandler.findByField('wa_number', userId);
          const findUserByNpm = await csvHandler.findByField('npm', npm);
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
