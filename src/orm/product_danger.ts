import { initModel, makeOneToMany, Model } from '@padoa/database';
import type { Sequelize } from 'sequelize';
import { Team } from '@padoa/meta';

import { ModelName, TableName } from '@src/orm/model.js';

class ProductDanger extends Model {
  public declare productId: number;
  public declare dangerId: number;
}

const initProductDanger = (sequelize: Sequelize): void => {
  initModel(
    ProductDanger,
    {},
    {
      sequelize,
      modelName: ModelName.ProductDanger,
      tableName: TableName.ProductDanger,
      tableOwner: Team.RC,
    },
  );
};

const associateProductDanger = (sequelize: Sequelize): void => {
  makeOneToMany(sequelize.model('product'), ProductDanger, 'productId', false);
  makeOneToMany(sequelize.model('danger'), ProductDanger, 'dangerId', false);
};

export { ProductDanger, initProductDanger, associateProductDanger };
