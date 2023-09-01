const { createLogger, format, transports } = require('winston');

// Custom log format
const customFormat = format.combine(
  // format.colorize(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`),
);

// Create a new logger instance
const logger = createLogger({
  format: customFormat,
  transports: [
    new transports.Console(), // Log to console
    new transports.File({ filename: 'app.log' }), // Log to file
  ],
});

module.exports = logger;
