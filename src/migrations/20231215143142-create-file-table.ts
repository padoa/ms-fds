import { AddAuditTrigger, AddSetUpdatedAtTrigger, createTable, wrapCommands } from '@padoa/database';
import { DataTypes } from 'sequelize';

import { sequelize } from '@helpers/database/index.js';

const fileFields = {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  filename: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  md5: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  mime: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  s3_name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  uuid: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
};

export async function up(): Promise<void> {
  await createTable(sequelize, 'file', fileFields);
  // await wrapCommands(sequelize, 'file', [new AddAuditTrigger(), new AddSetUpdatedAtTrigger()]);
}
