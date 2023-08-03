const fs = require('fs');

const createFile = async (filePath, content) => {
  try {
    await fs.promises.writeFile(filePath, content);
    return true;
  } catch (error) {
    return false;
  }
};

const checkFileExists = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

const createDirectory = async (directoryName) => {
  try {
    fs.mkdirSync(directoryName);
    return true;
  } catch (err) {
    return false;
  }
};

module.exports = {
  createFile,
  checkFileExists,
  createDirectory,
};
