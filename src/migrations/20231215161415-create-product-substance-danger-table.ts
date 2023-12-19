import { AddFk, AddSetUpdatedAtTrigger, createTable, FOREIGN_KEY_ACTIONS, wrapCommands } from '@padoa/database';
import { DataTypes } from 'sequelize';

import { sequelize } from '@helpers/database/index.js';

export async function up(): Promise<void> {
  await createTable(sequelize, 'product_substance_danger', {
    dangerId: {
      field: 'danger_id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productSubstanceId: {
      field: 'product_substance_id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
  await wrapCommands(sequelize, 'product_substance_danger', [
    new AddSetUpdatedAtTrigger(),
    new AddFk('danger', FOREIGN_KEY_ACTIONS.CASCADE),
    new AddFk('product_substance', FOREIGN_KEY_ACTIONS.CASCADE),
  ]);
}
