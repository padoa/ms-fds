import { BaseBuilder } from '@padoa/meta';

import { CAS_NUMBER, PAGE_NUMBER, POSITION_PROPORTION_X, POSITION_PROPORTION_Y } from '@topics/engine/__fixtures__/fixtures.constants.js';
import type { IExtractedCasNumber } from '@topics/engine/model/fds.model.js';

export class CasNumberBuilder extends BaseBuilder<IExtractedCasNumber> {
  public withValue = this.withValueFor('value');
  public withMetaData = this.withValueFor('metaData');

  protected getDefaultValues(): IExtractedCasNumber {
    return {
      value: CAS_NUMBER,
      metaData: {
        startBox: { pageNumber: PAGE_NUMBER, xPositionProportion: POSITION_PROPORTION_X, yPositionProportion: POSITION_PROPORTION_Y },
      },
    };
  }
}
