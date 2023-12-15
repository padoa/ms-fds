import { AddAuditTrigger, AddFk, AddSetUpdatedAtTrigger, createTable, FOREIGN_KEY_ACTIONS, wrapCommands } from '@padoa/database';
import { DataTypes } from 'sequelize';

import { sequelize } from '@helpers/database/index.js';

export async function up(): Promise<void> {
  await createTable(sequelize, 'substance_danger', {
    substanceId: {
      field: 'substance_id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dangerId: {
      field: 'danger_id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
  await wrapCommands(sequelize, 'substance_danger', [
    // new AddAuditTrigger(),
    // new AddSetUpdatedAtTrigger(),
    new AddFk('substance', FOREIGN_KEY_ACTIONS.CASCADE),
    new AddFk('danger', FOREIGN_KEY_ACTIONS.CASCADE),
  ]);
}
