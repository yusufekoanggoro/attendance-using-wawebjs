const wrapper = require('../../lib/utils/wrapper');
const CSVHandler = require('../../lib/csv');
const sharedUc = require('./shared');

const getProfile = async (payload) => {
  try {
    const {
      id: wa_number,
    } = payload.userInfo;

    const filePathUserMaster = await sharedUc.getFilePathUserMaster();
    if (filePathUserMaster.err) return wrapper.error('file not found');

    const csvUserMaster = new CSVHandler(filePathUserMaster.data);

    const findUserByWaNumber = await csvUserMaster.findOneByField('wa_number', wa_number);
    if (findUserByWaNumber.err) return wrapper.error('profile tidak ditemukan');

    const finalString = `${findUserByWaNumber.data.npm} ${findUserByWaNumber.data.full_name}`;
    return wrapper.data(finalString);
  } catch (error) {
    return wrapper.error(error);
  }
};

module.exports = getProfile;
