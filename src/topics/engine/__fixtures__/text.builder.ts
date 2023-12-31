import { BaseBuilder } from '@padoa/meta';

import { PAGE_NUMBER, POSITION_PROPORTION_X, POSITION_PROPORTION_Y, RAW_TEXT_CONTENT } from '@topics/engine/__fixtures__/fixtures.constants.js';
import type { IText } from '@topics/engine/model/fds.model.js';
import { TextCleanerService } from '@topics/engine/text-cleaner.service.js';

export class TextBuilder extends BaseBuilder<IText> {
  public withXPositionProportion = this.withValueFor('xPositionProportion');
  public withYPositionProportion = this.withValueFor('yPositionProportion');

  public withContent = (rawContent: string): TextBuilder => {
    return this.withValueFor('rawContent')(rawContent).withValueFor('cleanContent')(TextCleanerService.cleanRawText(rawContent));
  };

  protected getDefaultValues(): IText {
    return {
      pageNumber: PAGE_NUMBER,
      xPositionProportion: POSITION_PROPORTION_X,
      yPositionProportion: POSITION_PROPORTION_Y,
      rawContent: RAW_TEXT_CONTENT,
      cleanContent: TextCleanerService.cleanRawText(RAW_TEXT_CONTENT),
    };
  }
}
