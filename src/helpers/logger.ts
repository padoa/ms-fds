import type { Logger } from '@padoa/logger';
import { LoggerFactory } from '@padoa/logger';
import config from 'config';

import { asyncLocalStorage } from '@helpers/async-local-storage.js';
import hash from '@src/hash.js';

export const baseLogger: Logger = new LoggerFactory({
  level: config.get('logger.level'),
  asyncLocalStorages: [asyncLocalStorage],
  extraBase: {
    hash,
  },
}).logger;

export default baseLogger;
