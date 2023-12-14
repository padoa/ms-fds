import { BaseBuilder } from '@padoa/meta';

import {
  CAS_NUMBER,
  CE_NUMBER,
  CONCENTRATION_VALUE,
  PAGE_NUMBER,
  POSITION_PROPORTION_X,
  POSITION_PROPORTION_Y,
} from '@topics/engine/__fixtures__/fixtures.constants.js';
import type { IExtractedSubstance } from '@topics/engine/model/fds.model.js';

export class SubstanceBuilder extends BaseBuilder<IExtractedSubstance> {
  public withCasNumber = this.withValueFor('casNumber');
  public withCeNumber = this.withValueFor('ceNumber');
  public withConcentration = this.withValueFor('concentration');
  public withMetaData = this.withValueFor('metaData');

  protected getDefaultValues(): IExtractedSubstance {
    return {
      casNumber: CAS_NUMBER,
      ceNumber: CE_NUMBER,
      concentration: CONCENTRATION_VALUE,
      metaData: {
        startBox: { pageNumber: PAGE_NUMBER, xPositionProportion: POSITION_PROPORTION_X, yPositionProportion: POSITION_PROPORTION_Y },
      },
    };
  }
}
