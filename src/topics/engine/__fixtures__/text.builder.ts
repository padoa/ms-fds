import { BaseBuilder } from '@padoa/meta';

import { PAGE_NUMBER, POSITION_PROPORTION_X, POSITION_PROPORTION_Y, TEXT_CONTENT } from '@topics/engine/__fixtures__/fixtures.constants.js';
import type { IText } from '@topics/engine/model/fds.model.js';

export class TextBuilder extends BaseBuilder<IText> {
  public withXPositionProportion = this.withValueFor('xPositionProportion');
  public withYPositionProportion = this.withValueFor('yPositionProportion');
  public withContent = this.withValueFor('content');

  protected getDefaultValues(): IText {
    return {
      pageNumber: PAGE_NUMBER,
      xPositionProportion: POSITION_PROPORTION_X,
      yPositionProportion: POSITION_PROPORTION_Y,
      content: TEXT_CONTENT,
    };
  }
}
