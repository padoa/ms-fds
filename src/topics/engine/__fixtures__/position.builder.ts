import { BaseBuilder } from '@padoa/meta';

import { POSITION_PROPORTION_X, POSITION_PROPORTION_Y } from '@topics/engine/__fixtures__/fixtures.constants.js';
import type { IPosition } from '@topics/engine/model/fds.model.js';

export class PositionBuilder extends BaseBuilder<IPosition> {
  public withXPositionProportion = this.withValueFor('xPositionProportion');
  public withYPositionProportion = this.withValueFor('yPositionProportion');
  public withPageNumber = this.withValueFor('pageNumber');

  protected getDefaultValues(): IPosition {
    return {
      pageNumber: 0,
      xPositionProportion: POSITION_PROPORTION_X,
      yPositionProportion: POSITION_PROPORTION_Y,
    };
  }
}
