import { initModel, makeOneToMany, Model } from '@padoa/database';
import type { Sequelize } from 'sequelize';
import { Team } from '@padoa/meta';

import { ModelName, TableName } from '@src/orm/model.js';

class ProductSubstanceDanger extends Model {
  public declare productSubstanceId: number;
  public declare dangerId: number;
}

const initProductSubstanceDanger = (sequelize: Sequelize): void => {
  initModel(
    ProductSubstanceDanger,
    {},
    {
      sequelize,
      modelName: ModelName.ProductSubstanceDanger,
      tableName: TableName.ProductSubstanceDanger,
      tableOwner: Team.RC,
    },
  );
};

const associateProductSubstanceDanger = (sequelize: Sequelize): void => {
  makeOneToMany(sequelize.model('productSubstance'), ProductSubstanceDanger, 'productSubstanceId', false);
  makeOneToMany(sequelize.model('danger'), ProductSubstanceDanger, 'dangerId', false);
};

export { ProductSubstanceDanger, initProductSubstanceDanger, associateProductSubstanceDanger };
