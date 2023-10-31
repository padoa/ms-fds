import { TransactionContextManager } from '@padoa/database';

import { sequelize } from '@helpers/database/index.js';

const transactionContextManager = new TransactionContextManager(sequelize);
export const transactionContext = transactionContextManager.transactionContext.bind(transactionContextManager);
