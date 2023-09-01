require('dotenv').config();
const confidence = require('confidence');

const config = {
  minSleepmsHandleBlasting: parseInt(process.env.MIN_SLEEPMS_HANDLE_BLASTING),
  maxSleepmsHandleBlasting: parseInt(process.env.MAX_SLEEPMS_HANDLE_BLASTING),
  redis: {
    connection: {
      host: process.env.REDIS_CLIENT_HOST,
      port: process.env.REDIS_CLIENT_PORT,
      passsword: process.env.REDIS_CLIENT_PASSWORD,
      auth_pass: process.env.REDIS_CLIENT_PASSWORD,
    },
    index: process.env.REDIS_CLIENT_INDEX
  },
  isCertainGroup: process.env.IS_CERTAIN_GROUP === 'true' ? true : false,
  allowedGroups: process.env.ALLOWED_GROUPS ? process.env.ALLOWED_GROUPS.split(',') : [],
};

const store = new confidence.Store(config);

exports.get = key => store.get(key);