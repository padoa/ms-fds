import { BaseBuilder } from '@padoa/meta';

import { CE_NUMBER, PAGE_NUMBER, POSITION_PROPORTION_X, POSITION_PROPORTION_Y } from '@topics/engine/__fixtures__/fixtures.constants.js';
import type { IExtractedConcentration } from '@topics/engine/model/fds.model.js';

export class CeNumberBuilder extends BaseBuilder<IExtractedConcentration> {
  public withValue = this.withValueFor('value');
  public withMetaData = this.withValueFor('metaData');

  protected getDefaultValues(): IExtractedConcentration {
    return {
      value: CE_NUMBER,
      metaData: {
        startBox: { pageNumber: PAGE_NUMBER, xPositionProportion: POSITION_PROPORTION_X, yPositionProportion: POSITION_PROPORTION_Y },
      },
    };
  }
}
