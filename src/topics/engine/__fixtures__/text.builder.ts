import { BaseBuilder } from '@padoa/meta';

import {
  CLEAN_TEXT_CONTENT,
  PAGE_NUMBER,
  POSITION_PROPORTION_X,
  POSITION_PROPORTION_Y,
  RAW_TEXT_CONTENT,
} from '@topics/engine/__fixtures__/fixtures.constants.js';
import type { IText } from '@topics/engine/model/fds.model.js';

export class TextBuilder extends BaseBuilder<IText> {
  public withXPositionProportion = this.withValueFor('xPositionProportion');
  public withYPositionProportion = this.withValueFor('yPositionProportion');
  public withRawContent = this.withValueFor('rawContent');
  public withCleanContent = this.withValueFor('cleanContent');

  protected getDefaultValues(): IText {
    return {
      pageNumber: PAGE_NUMBER,
      xPositionProportion: POSITION_PROPORTION_X,
      yPositionProportion: POSITION_PROPORTION_Y,
      rawContent: RAW_TEXT_CONTENT,
      cleanContent: CLEAN_TEXT_CONTENT,
    };
  }
}
