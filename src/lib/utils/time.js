const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sleepRandom = async (min, max) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports = {
  sleep,
  sleepRandom,
};
