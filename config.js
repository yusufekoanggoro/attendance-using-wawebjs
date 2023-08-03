require('dotenv').config();
const confidence = require('confidence');

const config = {
    initialAttendance: process.env.INITIAL_ATTANDANCE
};

const store = new confidence.Store(config);

exports.get = key => store.get(key);
