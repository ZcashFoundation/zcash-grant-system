import { createLogger, format, transports } from 'winston';
// @ts-ignore
import * as paths from '../config/paths';
const { combine, timestamp, prettyPrint, printf, colorize } = format;

const custom = combine(
  timestamp({ format: 'YY/MM/DD HH:mm:ss' }),
  colorize(),
  printf(info => `${info.timestamp}[${info.level}]  ${info.message}`),
);

const enumerateErrorFormat = format((info: any) => {
  if (info.message instanceof Error) {
    info.message = Object.assign(
      {
        message: info.message.message,
        stack: info.message.stack,
      },
      info.message,
    );
  }
  if (info instanceof Error) {
    return Object.assign(
      {
        message: info.message,
        stack: info.stack,
      },
      info,
    );
  }
  return info;
});

// levels: error, warn, info, verbose, debug, silly
const log = createLogger({
  level: 'verbose',
  exitOnError: true,
  format: combine(enumerateErrorFormat(), timestamp(), prettyPrint()),
  transports: [
    new transports.File({
      filename: `${paths.logs}/app.log`,
      level: 'info',
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new transports.Console({
      level: 'verbose',
      handleExceptions: true,
      format: custom,
    }),
  ],
});

export default log;
