import { BaseBuilder } from '@padoa/meta';

import type { IText } from '@topics/engine/model/fds.model.js';

export class TextBuilder extends BaseBuilder<IText> {
  public withXPositionProportion = this.withValueFor('xPositionProportion');
  public withYPositionProportion = this.withValueFor('yPositionProportion');
  public withContent = this.withValueFor('content');

  protected getDefaultValues(): IText {
    return {
      xPositionProportion: 0,
      yPositionProportion: 0,
      content: '',
    };
  }
}
