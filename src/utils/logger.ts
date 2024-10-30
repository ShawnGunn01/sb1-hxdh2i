import winston from 'winston';
import { datadogLogs } from '@datadog/browser-logs';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Send logs to Datadog
logger.add(new winston.transports.Stream({
  stream: {
    write: (message) => {
      datadogLogs.logger.info(message);
    },
  },
}));

export default logger;