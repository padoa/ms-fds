import type { Sequelize } from 'sequelize';
import { DataTypes } from 'sequelize';
import { initModel, Model } from '@padoa/database';
import { Team } from '@padoa/meta';
import { DangerType } from '@padoa/chemical-risk';

import { ModelName, TableName } from '@src/orm/model.js';

class Danger extends Model {
  public declare code: string;
  public declare description: string;
  public declare type: DangerType;
}

const initDanger = (sequelize: Sequelize): void => {
  initModel(
    Danger,
    {
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
    },
    {
      sequelize,
      modelName: ModelName.Danger,
      tableName: TableName.Danger,
      tableOwner: Team.RC,
    },
  );
};

export { Danger, initDanger };
