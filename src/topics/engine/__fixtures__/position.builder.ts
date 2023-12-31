import type { IPosition } from '@padoa/chemical-risk';
import { BaseBuilder } from '@padoa/meta';

import { PAGE_NUMBER, POSITION_PROPORTION_X, POSITION_PROPORTION_Y } from '@topics/engine/__fixtures__/fixtures.constants.js';

export class PositionBuilder extends BaseBuilder<IPosition> {
  public withXPositionProportion = this.withValueFor('xPositionProportion');
  public withYPositionProportion = this.withValueFor('yPositionProportion');
  public withPageNumber = this.withValueFor('pageNumber');

  protected getDefaultValues(): IPosition {
    return {
      pageNumber: PAGE_NUMBER,
      xPositionProportion: POSITION_PROPORTION_X,
      yPositionProportion: POSITION_PROPORTION_Y,
    };
  }
}
