import type { IExtractedCeNumber } from '@padoa/chemical-risk';
import { BaseBuilder } from '@padoa/meta';

import { PAGE_NUMBER, POSITION_PROPORTION_X, POSITION_PROPORTION_Y, RAW_CE_NUMBER } from '@topics/engine/__fixtures__/fixtures.constants.js';

export class CeNumberBuilder extends BaseBuilder<IExtractedCeNumber> {
  public withValue = this.withValueFor('value');
  public withMetaData = this.withValueFor('metaData');

  protected getDefaultValues(): IExtractedCeNumber {
    return {
      value: RAW_CE_NUMBER,
      metaData: {
        startBox: { pageNumber: PAGE_NUMBER, xPositionProportion: POSITION_PROPORTION_X, yPositionProportion: POSITION_PROPORTION_Y },
      },
    };
  }
}
