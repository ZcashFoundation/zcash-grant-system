import winston from 'winston';
import env from './env';

const logger = winston.createLogger({
  level: env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'MM/DD/YY HH:mm:ss' }),
    winston.format.printf(i => `[${i.timestamp}] [${i.level}]: ${i.message}`),
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

export default logger;
