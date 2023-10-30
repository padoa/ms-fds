/* c8 ignore start */

import path from 'path';

import config from 'config';
import { promiseTimeoutWithError } from '@padoa/promise';
import { runMigrations } from '@padoa/database';
import type { Transaction } from 'sequelize';

import { sequelize } from '@helpers/database/index.js';

export const runMigrationsWithTimeout = async (
  timeout: number,
  { transaction = null }: { transaction?: Transaction } = {},
): Promise<Record<string, number>> =>
  promiseTimeoutWithError(
    (async (): Promise<Record<string, number>> => {
      if (!config.get('sequelize.uniqueTransaction')) {
        throw new Error('should always launch with config.force_unique_transaction enabled');
      }
      return runMigrations(sequelize, path.normalize(`${new URL('.', import.meta.url).pathname}/../migrations`), {
        transaction,
        role: config.get('sequelize.postgres.owner'),
      });
    })(),
    timeout,
    { message: `Migrations timeout exceeded (${timeout}s)` },
  );

export default async (): Promise<void> => {
  await runMigrationsWithTimeout(config.get('sequelize.migrations.timeout.global'));
};
/* c8 ignore stop */
