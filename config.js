require('dotenv').config();
const confidence = require('confidence');

const config = {
    initialAttendance: process.env.INITIAL_ATTANDANCE,
    minSleepmsHandleBlasting: parseInt(process.env.MIN_SLEEPMS_HANDLE_BLASTING),
    maxSleepmsHandleBlasting: parseInt(process.env.MAX_SLEEPMS_HANDLE_BLASTING)
};

const store = new confidence.Store(config);

exports.get = key => store.get(key);
