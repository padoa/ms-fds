import type { PostgresConfig, SequelizeFactoryConfiguration } from '@padoa/database';
import config from 'config';
import { requestIdName } from '@padoa/meta';

import { asyncLocalStorage } from '@src/helpers/async-local-storage.js';

export const databaseName = config.get<string>('sequelize.postgres.database');

export const postgresConfigFactory = ({ withDatabaseName = true } = {}): PostgresConfig => ({
  username: config.get('sequelize.postgres.username'),
  password: config.get('sequelize.postgres.password'),
  hostname: config.get('sequelize.postgres.hostname'),
  port: Number(config.get('sequelize.postgres.port')),
  database: withDatabaseName ? databaseName : undefined,
  sslmode: config.get('sequelize.postgres.sslmode'),
  sslConfiguration: {
    rejectUnauthorized: config.get('sequelize.postgres.ssl.rejectUnauthorized'),
    ca: config.get('sequelize.postgres.ssl.ca'),
    key: config.get('sequelize.postgres.ssl.key'),
    cert: config.get('sequelize.postgres.ssl.cert'),
  },
  pool: {
    min: config.get('sequelize.postgres.pool.min'),
    max: config.get('sequelize.postgres.pool.max'),
    idle: config.get('sequelize.postgres.pool.idle'),
    acquire: config.get('sequelize.postgres.pool.acquire'),
  },
});

export const sequelizeFactoryConfiguration: SequelizeFactoryConfiguration = {
  applicationName: process.argv[0],
  forceUniqueTransaction: config.get('sequelize.uniqueTransaction'),
  storages: [asyncLocalStorage],
  logSql: process.env.SQL === 'true',
  benchmark: process.env.SQL_LOG_QUERIES_THRESHOLD_MS
    ? { activated: true, minDuration: parseInt(process.env.SQL_LOG_QUERIES_THRESHOLD_MS, 10) }
    : { activated: false },

  queryTracking: {
    enabled: config.get('sequelize.hooks.requestIdComments.enabled'),
    config: [
      {
        storageKey: requestIdName,
        commentKey: requestIdName,
      },
      {
        storageKey: 'eventRule',
        commentKey: 'EVTRULE',
      },
    ],
  },
};
