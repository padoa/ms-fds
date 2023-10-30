import path, { dirname } from 'node:path';
import url from 'node:url';

import { TaskWrapper } from '@padoa/tasks';
import { AsyncLocalStorage } from '@padoa/async-local-storage';

import logger from '@helpers/logger.js';

const asyncLocalStorage = new AsyncLocalStorage();

const { pathname } = url.parse(import.meta.url);

const taskWrapper = new TaskWrapper(path.join(dirname(pathname), '/tasks/'), asyncLocalStorage, { logger });
taskWrapper
  .wrap(process.argv[2])
  .then(() => {
    // eslint-disable-next-line no-process-exit
    process.exit(0);
  })
  .catch((err) => {
    logger.error(err);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  });
