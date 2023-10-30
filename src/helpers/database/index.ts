import { SequelizeFactory } from '@padoa/database';

import { postgresConfigFactory, sequelizeFactoryConfiguration } from '@helpers/database/config.js';
import logger from '@src/helpers/logger.js';

const postgresConfig = postgresConfigFactory({ withDatabaseName: true });
export const { sequelize } = new SequelizeFactory(postgresConfig, sequelizeFactoryConfiguration, logger);
