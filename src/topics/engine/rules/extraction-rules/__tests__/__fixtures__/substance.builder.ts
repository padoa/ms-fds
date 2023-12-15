import type { IExtractedSubstance } from '@padoa/chemical-risk';
import { BaseBuilder } from '@padoa/meta';

import {
  H_DANGER,
  PAGE_NUMBER,
  POSITION_PROPORTION_X,
  POSITION_PROPORTION_Y,
  RAW_CAS_NUMBER,
  RAW_CE_NUMBER,
  RAW_CONCENTRATION_VALUE,
} from '@topics/engine/__fixtures__/fixtures.constants.js';

export class SubstanceBuilder extends BaseBuilder<IExtractedSubstance> {
  public withCasNumber = this.withValueFor('casNumber');
  public withCeNumber = this.withValueFor('ceNumber');
  public withConcentration = this.withValueFor('concentration');
  public withHazards = this.withValueFor('hazards');

  protected getDefaultValues(): IExtractedSubstance {
    const metaData = {
      startBox: { pageNumber: PAGE_NUMBER, xPositionProportion: POSITION_PROPORTION_X, yPositionProportion: POSITION_PROPORTION_Y },
    };

    return {
      casNumber: { value: RAW_CAS_NUMBER, metaData },
      ceNumber: { value: RAW_CE_NUMBER, metaData },
      concentration: { value: RAW_CONCENTRATION_VALUE, metaData },
      hazards: [{ code: H_DANGER, metaData }],
    };
  }
}
