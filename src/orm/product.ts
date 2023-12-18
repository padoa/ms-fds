import type { Sequelize } from 'sequelize';
import { DataTypes } from 'sequelize';
import { initModel, makeOneToMany, Model } from '@padoa/database';
import { Team } from '@padoa/meta';
import { ProductOrigin, ProductWarningNotice } from '@padoa/chemical-risk';

import { ModelName, TableName } from '@src/orm/model.js';

class Product extends Model {
  public declare fdsFileId: number;
  public declare name: string;
  public declare producer: string;
  public declare origin: ProductOrigin;
  public declare physicalState: string;
  public declare boilingPoint: string;
  public declare vaporPressure: string;
  public declare vaporPressureTemperature: string;
  public declare warningNotice: ProductWarningNotice;
  public declare revisionDate: Date;
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
        allowNull: false,
      },
      physicalState: {
        field: 'physical_state',
        type: DataTypes.STRING,
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
      vaporPressureTemperature: {
        field: 'vapor_pressure_temperature',
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
      tableName: TableName[ModelName.Product],
      tableOwner: Team.RC,
    },
  );
};

const associateFdsFile = (sequelize: Sequelize): void => {
  makeOneToMany(sequelize.model('fdsFile'), Product, 'fdsFileId', true);
};

export { Product, initProduct, associateFdsFile };
