const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sleepRandom = async (min, max) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const validateTimeString = (timeString) => {
  // Regular expression to match "HH:mm:ss" format
  const regex = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;

  return regex.test(timeString);
};

module.exports = {
  sleep,
  sleepRandom,
  validateTimeString,
};
