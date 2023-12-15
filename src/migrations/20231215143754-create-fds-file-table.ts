import { AddAuditTrigger, AddFk, AddSetUpdatedAtTrigger, createTable, FOREIGN_KEY_ACTIONS, wrapCommands } from '@padoa/database';
import { DataTypes } from 'sequelize';

import { sequelize } from '@helpers/database/index.js';

const fdsFileFields = {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  fileId: {
    field: 'file_id',
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  parsable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  frenchFile: {
    field: 'french_file',
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
};

export async function up(): Promise<void> {
  await createTable(sequelize, 'fds_file', fdsFileFields);
  await wrapCommands(sequelize, 'fds_file', [
    // new AddAuditTrigger(),
    //  new AddSetUpdatedAtTrigger(),
    new AddFk('file', FOREIGN_KEY_ACTIONS.CASCADE),
  ]);
}
