import { BaseBuilder } from '@padoa/meta';

import { PAGE_HEIGHT, PAGE_WIDTH, POSITION_PROPORTION_X, POSITION_PROPORTION_Y } from '@topics/engine/__fixtures__/fixtures.constants.js';
import type { IRawStroke } from '@topics/engine/model/fds.model.js';
import { RAW_STROKE_MAX_WIDTH_IN_PROPORTION } from '@topics/engine/pdf-extractor/pdf-stroke-extractor.config.js';

export class RawStrokeBuilder extends BaseBuilder<IRawStroke> {
  public withX = this.withValueFor('x');
  public withY = this.withValueFor('y');
  public withW = this.withValueFor('w');
  public withL = this.withValueFor('l');

  protected getDefaultValues(): IRawStroke {
    return {
      x: POSITION_PROPORTION_X * PAGE_WIDTH,
      y: POSITION_PROPORTION_Y * PAGE_HEIGHT,
      w: RAW_STROKE_MAX_WIDTH_IN_PROPORTION * PAGE_HEIGHT,
      l: RAW_STROKE_MAX_WIDTH_IN_PROPORTION * PAGE_WIDTH,
    };
  }
}
