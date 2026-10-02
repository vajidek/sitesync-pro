import winston from 'winston';
import { ENV } from '../config/env';

export const logger = winston.createLogger({
  level: ENV.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'sitesync-pro-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, service, stack }) => {
          return `[${timestamp}] [${level}]: ${message}${stack ? `\n${stack}` : ''}`;
        })
      ),
    }),
  ],
});
