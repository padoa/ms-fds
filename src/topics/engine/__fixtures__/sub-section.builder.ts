import { BaseBuilder } from '@padoa/meta';

import { POSITION_PROPORTION_X, POSITION_PROPORTION_Y } from '@topics/engine/__fixtures__/fixtures.constants.js';
import type { ISubsection } from '@topics/engine/model/fds.model.js';

export class SubSectionBuilder extends BaseBuilder<ISubsection> {
  public withStartBox = this.withValueFor('startBox');
  public withEndBox = this.withValueFor('endBox');
  public withLines = this.withValueFor('lines');
  public withStrokes = this.withValueFor('strokes');

  protected getDefaultValues(): ISubsection {
    return {
      startBox: {
        pageNumber: 0,
        xPositionProportion: POSITION_PROPORTION_X,
        yPositionProportion: POSITION_PROPORTION_Y,
      },
      lines: [],
      strokes: [],
    };
  }
}
