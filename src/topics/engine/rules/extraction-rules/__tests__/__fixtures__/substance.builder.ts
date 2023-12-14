import type { IExtractedSubstance } from '@padoa/chemical-risk';
import { BaseBuilder } from '@padoa/meta';

import {
  CAS_NUMBER,
  CE_NUMBER,
  CONCENTRATION_VALUE,
  PAGE_NUMBER,
  POSITION_PROPORTION_X,
  POSITION_PROPORTION_Y,
} from '@topics/engine/__fixtures__/fixtures.constants.js';

export class SubstanceBuilder extends BaseBuilder<IExtractedSubstance> {
  public withCasNumber = this.withValueFor('casNumber');
  public withCeNumber = this.withValueFor('ceNumber');
  public withConcentration = this.withValueFor('concentration');

  protected getDefaultValues(): IExtractedSubstance {
    const metaData = {
      startBox: { pageNumber: PAGE_NUMBER, xPositionProportion: POSITION_PROPORTION_X, yPositionProportion: POSITION_PROPORTION_Y },
    };

    return {
      casNumber: { value: CAS_NUMBER, metaData },
      ceNumber: { value: CE_NUMBER, metaData },
      concentration: { value: CONCENTRATION_VALUE, metaData },
    };
  }
}
