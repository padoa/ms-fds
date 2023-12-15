import type { Sequelize } from 'sequelize';
import { DataTypes } from 'sequelize';
import { initModel, makeOneToMany, Model } from '@padoa/database';
import { Team } from '@padoa/meta';

import { ModelName } from '@src/orm/model.js';

class FdsFile extends Model {
  public declare fileId: number;
  public declare parsable: boolean;
  public declare frenchFile: boolean;
}

const initFdsFile = (sequelize: Sequelize): void => {
  initModel(
    FdsFile,
    {
      parsable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      frenchFile: {
        field: 'french_file',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: ModelName.FdsFile,
      tableName: 'fds_file',
      tableOwner: Team.RC,
    },
  );
};

const associateFdsFile = (sequelize: Sequelize): void => {
  makeOneToMany(sequelize.model('file'), FdsFile, 'fileId', false);
};

export { FdsFile, initFdsFile, associateFdsFile };
