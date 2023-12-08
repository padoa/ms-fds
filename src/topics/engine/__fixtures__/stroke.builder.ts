import { BaseBuilder } from '@padoa/meta';

import { POSITION_PROPORTION_X, POSITION_PROPORTION_Y } from '@topics/engine/__fixtures__/fixtures.constants.js';
import type { IStroke } from '@topics/engine/model/fds.model.js';
import { RAW_STROKE_MAX_WIDTH_IN_PROPORTION } from '@topics/engine/pdf-extractor/pdf-stroke-extractor.config.js';

export class StrokeBuilder extends BaseBuilder<IStroke> {
  public withStartBox = this.withValueFor('startBox');
  public withEndBox = this.withValueFor('endBox');

  protected getDefaultValues(): IStroke {
    return {
      startBox: { pageNumber: 1, xPositionProportion: POSITION_PROPORTION_X, yPositionProportion: POSITION_PROPORTION_Y },
      endBox: {
        pageNumber: 1,
        xPositionProportion: POSITION_PROPORTION_X + RAW_STROKE_MAX_WIDTH_IN_PROPORTION,
        yPositionProportion: POSITION_PROPORTION_Y + RAW_STROKE_MAX_WIDTH_IN_PROPORTION,
      },
    };
  }
}
