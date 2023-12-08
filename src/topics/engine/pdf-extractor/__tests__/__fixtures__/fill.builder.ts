import { BaseBuilder } from '@padoa/meta';

import { PAGE_HEIGHT, PAGE_WIDTH, POSITION_PROPORTION_X, POSITION_PROPORTION_Y } from '@topics/engine/__fixtures__/fixtures.constants.js';
import type { IFill } from '@topics/engine/model/fds.model.js';
import { FILL_MAX_WIDTH_IN_PROPORTION } from '@topics/engine/pdf-extractor/pdf-stroke-extractor.config.js';

export class FillBuilder extends BaseBuilder<IFill> {
  public withX = this.withValueFor('x');
  public withY = this.withValueFor('y');
  public withW = this.withValueFor('w');
  public withH = this.withValueFor('h');

  protected getDefaultValues(): IFill {
    return {
      x: POSITION_PROPORTION_X * PAGE_WIDTH,
      y: POSITION_PROPORTION_Y * PAGE_HEIGHT,
      w: FILL_MAX_WIDTH_IN_PROPORTION * PAGE_WIDTH,
      h: FILL_MAX_WIDTH_IN_PROPORTION * PAGE_HEIGHT,
    };
  }
}
