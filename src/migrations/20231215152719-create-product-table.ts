import { AddFk, AddSetUpdatedAtTrigger, createTable, FOREIGN_KEY_ACTIONS, wrapCommands } from '@padoa/database';
import { DataTypes } from 'sequelize';

import { sequelize } from '@helpers/database/index.js';

enum ProductOrigin {
  EXTRACTION_ENGINE = 'extraction_engine',
  TOXICOLOGIST = 'toxicologist',
  CLIENT = 'client',
}

enum ProductPhysicalState {
  SOLID = 'solid',
  LIQUID = 'liquid',
  GAS = 'gas',
}

enum ProductWarningNotice {
  DANGER = 'danger',
  WARNING = 'warning',
  NONE = 'none',
}

const productFields = {
  fdsFileId: {
    field: 'fds_file_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  producer: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  origin: {
    type: DataTypes.ENUM,
    values: Object.values(ProductOrigin),
    allowNull: true,
  },
  physicalState: {
    field: 'physical_state',
    type: DataTypes.ENUM,
    values: Object.values(ProductPhysicalState),
    allowNull: true,
  },
  boilingPoint: {
    field: 'boiling_point',
    type: DataTypes.STRING,
    allowNull: true,
  },
  vaporPressure: {
    field: 'vapor_pressure',
    type: DataTypes.STRING,
    allowNull: true,
  },
  warningNotice: {
    field: 'warning_notice',
    type: DataTypes.ENUM,
    values: Object.values(ProductWarningNotice),
    allowNull: true,
  },
  revisionDate: {
    field: 'revision_date',
    type: DataTypes.DATE,
    allowNull: true,
  },
};

export async function up(): Promise<void> {
  await createTable(sequelize, 'product', productFields);
  await wrapCommands(sequelize, 'product', [new AddSetUpdatedAtTrigger(), new AddFk('fds_file', FOREIGN_KEY_ACTIONS.SET_NULL)]);
}
