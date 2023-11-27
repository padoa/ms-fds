import _ from 'lodash';

import type { IBox, IPageDimension, IRatioXY } from '@topics/engine/model/fds.model.js';

export class ExtractionRulesHelper {
  public static getStartAndEndBoxRatio(
    pageDimension: IPageDimension,
    startBox: IBox,
    endBox?: IBox,
  ): { startBoxRatio: IRatioXY; endBoxRatio?: IRatioXY } {
    const { width, height } = pageDimension;
    const startBoxRatio = { ratioX: startBox.x / width, ratioY: startBox.y / height };
    const endBoxRatio = !_.isEmpty(endBox) ? { ratioX: endBox.x / width, ratioY: endBox.y / height } : null;

    return { startBoxRatio, endBoxRatio };
  }
}
