const { createLogger, format, transports } = require('winston');

const { combine, printf } = format;

// Custom log format
const customFormat = printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`);

// Create a new logger instance
const logger = createLogger({
  format: combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat,
  ),
  transports: [
    new transports.Console(), // Log to console
    new transports.File({ filename: 'app.log' }), // Log to file
  ],
});

module.exports = logger;
