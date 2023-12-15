import type { IExtractedConcentration } from '@padoa/chemical-risk';
import { BaseBuilder } from '@padoa/meta';

import {
  PAGE_NUMBER,
  POSITION_PROPORTION_X,
  POSITION_PROPORTION_Y,
  RAW_CONCENTRATION_VALUE,
} from '@topics/engine/__fixtures__/fixtures.constants.js';

export class ConcentrationBuilder extends BaseBuilder<IExtractedConcentration> {
  public withValue = this.withValueFor('value');
  public withMetaData = this.withValueFor('metaData');

  protected getDefaultValues(): IExtractedConcentration {
    return {
      value: RAW_CONCENTRATION_VALUE,
      metaData: {
        startBox: { pageNumber: PAGE_NUMBER, xPositionProportion: POSITION_PROPORTION_X, yPositionProportion: POSITION_PROPORTION_Y },
      },
    };
  }
}
