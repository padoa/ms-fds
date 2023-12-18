import { initModel, makeOneToMany, Model } from '@padoa/database';
import type { Sequelize } from 'sequelize';
import { Team } from '@padoa/meta';
import { DataTypes } from 'sequelize';

import { ModelName, TableName } from '@src/orm/model.js';

class ProductSubstance extends Model {
  public declare productId: number;
  public declare substanceId: number;
  public declare concentration: string;
}

const initProductSubstance = (sequelize: Sequelize): void => {
  initModel(
    ProductSubstance,
    {
      concentration: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: ModelName.ProductSubstance,
      tableName: TableName[ModelName.ProductSubstance],
      tableOwner: Team.RC,
    },
  );
};

const associateProductSubstance = (sequelize: Sequelize): void => {
  makeOneToMany(sequelize.model('product'), ProductSubstance, 'productId', false);
  makeOneToMany(sequelize.model('substance'), ProductSubstance, 'substanceId', false);
};

export { ProductSubstance, initProductSubstance, associateProductSubstance };
