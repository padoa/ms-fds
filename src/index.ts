import { setupAndStartHttpServer } from '@padoa/express';
import config from 'config';

import { app } from '@src/app.js';
import logger from '@src/helpers/logger.js';

const port = config.get<number>('server.port');

process.on('unhandledRejection', (reason: Error) => {
  // eslint-disable-next-line no-param-reassign
  reason.message = `Unhandled rejection : ${reason.message}`;
  logger.error(reason);
});

// eslint-disable-next-line @typescript-eslint/no-floating-promises
setupAndStartHttpServer(app, port, { logger });
