import type { Sequelize } from 'sequelize';
import { DataTypes } from 'sequelize';
import { initModel, Model } from '@padoa/database';
import { Team } from '@padoa/meta';

import { ModelName, TableName } from '@src/orm/model.js';

class Substance extends Model {
  public declare name: string;
  public declare casNumber: string;
  public declare ceNumber: string;
}

const initSubstance = (sequelize: Sequelize): void => {
  initModel(
    Substance,
    {
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
    },
    {
      sequelize,
      modelName: ModelName.Substance,
      tableName: TableName[ModelName.Substance],
      tableOwner: Team.RC,
    },
  );
};

export { Substance, initSubstance };
