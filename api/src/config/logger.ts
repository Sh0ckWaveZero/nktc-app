import { join } from 'node:path';
import { createPinoLogger, pino } from '@bogeychan/elysia-logger';

export const logger = createPinoLogger({
  transport: {
    targets: [
      {
        target: 'pino-roll',
        options: {
          file: join('logs', 'log'),
          frequency: 'daily',
          mkdir: true,
          sync: false,
        },
      },
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    ],
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  level: 'info',
});

export const databaseLogger = logger.child({ service: 'Database' });
export const appLogger = logger.child({ service: 'App' });
