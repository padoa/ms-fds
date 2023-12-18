import type { Sequelize } from 'sequelize';
import { FileBase, initFileBase } from '@padoa/file-system';
import { Team } from '@padoa/meta';

import { ModelName, TableName } from '@src/orm/model.js';

class File extends FileBase {}

const initFile = (sequelize: Sequelize): void => {
  initFileBase(File, {}, { sequelize, modelName: ModelName.File, tableName: TableName[ModelName.File], tableOwner: Team.RC });
};

export { initFile, File };
