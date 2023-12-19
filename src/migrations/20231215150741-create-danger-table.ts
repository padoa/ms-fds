import { AddSetUpdatedAtTrigger, AddUniqueIndex, createTable, wrapCommands } from '@padoa/database';
import { DataTypes } from 'sequelize';

import { sequelize } from '@helpers/database/index.js';

enum DangerType {
  HAZARD = 'hazard',
  EUH_HAZARD = 'euh_hazard',
  PRECAUTION = 'precaution',
}

const dangerFields = {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM,
    values: Object.values(DangerType),
    allowNull: false,
  },
};

export async function up(): Promise<void> {
  await createTable(sequelize, 'danger', dangerFields);
  await wrapCommands(sequelize, 'danger', [new AddSetUpdatedAtTrigger(), new AddUniqueIndex('index_danger_code', ['code'])]);
}
