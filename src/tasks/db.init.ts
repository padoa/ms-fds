/* c8 ignore start */

import { promiseTimeoutWithError } from '@padoa/promise';
import { initDb } from '@padoa/database';

import { createDatabase } from '@helpers/database/create.database.js';
import logger from '@src/helpers/logger.js';

export default async (): Promise<void> => {
  await promiseTimeoutWithError(
    (async (): Promise<void> => {
      logger.info('Database creation internal');

      await createDatabase();

      logger.info('Database init internal');

      // Dynamic import is mandatory: Otherwise the sequelize instance would be init before creating the DB, which would fail if it does not yet exist
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { sequelize } = await import('@helpers/database');

      await initDb(sequelize, { logger });
    })(),
    240,
  );
};
/* c8 ignore stop */
