import type { Sequelize } from 'sequelize';
import { DataTypes } from 'sequelize';
import { initModel, makeOneToMany, Model } from '@padoa/database';
import { Team } from '@padoa/meta';
import { ProductOrigin, ProductPhysicalState, ProductWarningNotice } from '@padoa/chemical-risk';

import { ModelName } from '@src/orm/model.js';

class Product extends Model {
  public declare fdsFileId?: number;
  public declare name?: string;
  public declare producer?: string;
  public declare origin?: ProductOrigin;
  public declare physicalState?: ProductPhysicalState;
  public declare boilingPoint?: string;
  public declare vaporPressure?: string;
  public declare warningNotice?: ProductWarningNotice;
  public declare revisionDate?: Date;
}

const initProduct = (sequelize: Sequelize): void => {
  initModel(
    Product,
    {
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
    },
    {
      sequelize,
      modelName: ModelName.Product,
      tableName: 'product',
      tableOwner: Team.RC,
    },
  );
};

const associateFdsFile = (sequelize: Sequelize): void => {
  makeOneToMany(sequelize.model('fdsFile'), Product, 'fdsFileId', true);
};

export { Product, initProduct, associateFdsFile };
