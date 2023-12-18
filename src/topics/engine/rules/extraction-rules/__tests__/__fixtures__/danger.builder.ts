import type { IExtractedDanger } from '@padoa/chemical-risk';
import { BaseBuilder } from '@padoa/meta';

import { RAW_H_DANGER, PAGE_NUMBER, POSITION_PROPORTION_X, POSITION_PROPORTION_Y } from '@topics/engine/__fixtures__/fixtures.constants.js';

export class DangerBuilder extends BaseBuilder<IExtractedDanger> {
  public withCode = this.withValueFor('code');
  public withMetaData = this.withValueFor('metaData');

  protected getDefaultValues(): IExtractedDanger {
    return {
      code: RAW_H_DANGER,
      metaData: {
        startBox: { pageNumber: PAGE_NUMBER, xPositionProportion: POSITION_PROPORTION_X, yPositionProportion: POSITION_PROPORTION_Y },
      },
    };
  }
}
