import { AddFk, AddSetUpdatedAtTrigger, createTable, FOREIGN_KEY_ACTIONS, wrapCommands } from '@padoa/database';
import { DataTypes } from 'sequelize';

import { sequelize } from '@helpers/database/index.js';

export async function up(): Promise<void> {
  await createTable(sequelize, 'product_substance', {
    productId: {
      field: 'product_id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    substanceId: {
      field: 'substance_id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    concentration: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
  await wrapCommands(sequelize, 'product_substance', [
    new AddSetUpdatedAtTrigger(),
    new AddFk('product', FOREIGN_KEY_ACTIONS.CASCADE),
    new AddFk('substance', FOREIGN_KEY_ACTIONS.CASCADE),
  ]);
}
