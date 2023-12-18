import { initModel, makeOneToMany, Model } from '@padoa/database';
import type { Sequelize } from 'sequelize';
import { Team } from '@padoa/meta';

import { ModelName, TableName } from '@src/orm/model.js';

class SubstanceDanger extends Model {
  public declare substanceId: number;
  public declare dangerId: number;
}

const initSubstanceDanger = (sequelize: Sequelize): void => {
  initModel(
    SubstanceDanger,
    {},
    {
      sequelize,
      modelName: ModelName.SubstanceDanger,
      tableName: TableName.SubstanceDanger,
      tableOwner: Team.RC,
    },
  );
};

const associateSubstanceDanger = (sequelize: Sequelize): void => {
  makeOneToMany(sequelize.model('substance'), SubstanceDanger, 'substanceId', false);
  makeOneToMany(sequelize.model('danger'), SubstanceDanger, 'dangerId', false);
};

export { SubstanceDanger, initSubstanceDanger, associateSubstanceDanger };
