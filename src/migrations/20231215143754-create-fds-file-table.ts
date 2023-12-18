import { AddFk, AddSetUpdatedAtTrigger, createTable, FOREIGN_KEY_ACTIONS, wrapCommands } from '@padoa/database';
import { DataTypes } from 'sequelize';

import { sequelize } from '@helpers/database/index.js';

const fdsFileFields = {
  fileId: {
    field: 'file_id',
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  parsable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  frenchFile: {
    field: 'french_file',
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
};

export async function up(): Promise<void> {
  await createTable(sequelize, 'fds_file', fdsFileFields);
  await wrapCommands(sequelize, 'fds_file', [new AddSetUpdatedAtTrigger(), new AddFk('file', FOREIGN_KEY_ACTIONS.CASCADE)]);
}
