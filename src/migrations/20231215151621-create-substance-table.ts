import { AddSetUpdatedAtTrigger, AddUniqueIndex, createTable, wrapCommands } from '@padoa/database';
import { DataTypes } from 'sequelize';

import { sequelize } from '@helpers/database/index.js';

const substanceFields = {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  casNumber: {
    field: 'cas_number',
    type: DataTypes.STRING,
    allowNull: true,
  },
  ceNumber: {
    field: 'ce_number',
    type: DataTypes.STRING,
    allowNull: true,
  },
};

export async function up(): Promise<void> {
  await createTable(sequelize, 'substance', substanceFields);
  await wrapCommands(sequelize, 'substance', [
    new AddSetUpdatedAtTrigger(),
    new AddUniqueIndex('index_substance_numbers', ['cas_number', 'ce_number']),
  ]);
}
