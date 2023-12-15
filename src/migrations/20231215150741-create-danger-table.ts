import { AddAuditTrigger, AddSetUpdatedAtTrigger, createTable, wrapCommands } from '@padoa/database';
import { DataTypes } from 'sequelize';

import { sequelize } from '@helpers/database/index.js';

enum DangerType {
  HAZARD = 'hazard',
  PRECAUTION = 'precaution',
}

const dangerFields = {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM,
    values: Object.values(DangerType),
    allowNull: false,
  },
};

export async function up(): Promise<void> {
  await createTable(sequelize, 'danger', dangerFields);
  // await wrapCommands(sequelize, 'danger', [new AddAuditTrigger(), new AddSetUpdatedAtTrigger()]);
}
