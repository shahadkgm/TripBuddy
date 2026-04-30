import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, ...metadata }) => {
      let metaString = '';
      if (Object.keys(metadata).length > 0) {
        metaString = ' ' + JSON.stringify(metadata);
      }
      return `${timestamp} ${level}: ${message}${metaString}`;
    })
  ),

  transports: [
    new winston.transports.Console(),

    // optional files
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/app.log' }),
  ],
});
