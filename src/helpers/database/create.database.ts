/* c8 ignore start */
import { createDB, SequelizeFactory } from '@padoa/database';

import { databaseName, postgresConfigFactory, sequelizeFactoryConfiguration } from '@helpers/database/config.js';
import logger from '@src/helpers/logger.js';

const postgresConfig = postgresConfigFactory({ withDatabaseName: false });
const { sequelize: sequelizeNoDB } = new SequelizeFactory(postgresConfig, sequelizeFactoryConfiguration, logger);

export const createDatabase = (): Promise<unknown> => createDB(sequelizeNoDB, databaseName);
/* c8 ignore stop */
