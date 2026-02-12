import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp }) =>
      `${timestamp} ${level}: ${message}`
    )
  ),

  transports: [
    new winston.transports.Console(),

    // optional files
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/app.log' }),
  ],
});
