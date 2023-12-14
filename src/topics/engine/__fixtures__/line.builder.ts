import { BaseBuilder } from '@padoa/meta';

import { PAGE_NUMBER, POSITION_PROPORTION_X, POSITION_PROPORTION_Y } from '@topics/engine/__fixtures__/fixtures.constants.js';
import type { ILine } from '@topics/engine/model/fds.model.js';

export class LineBuilder extends BaseBuilder<ILine> {
  public withStartBox = this.withValueFor('startBox');
  public withEndBox = this.withValueFor('endBox');
  public withTexts = this.withValueFor('texts');

  protected getDefaultValues(): ILine {
    return {
      startBox: { pageNumber: PAGE_NUMBER, xPositionProportion: POSITION_PROPORTION_X, yPositionProportion: POSITION_PROPORTION_Y },
      texts: [],
    };
  }
}
