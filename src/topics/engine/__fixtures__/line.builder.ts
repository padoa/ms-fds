import { BaseBuilder } from '@padoa/meta';

import type { ILine } from '@topics/engine/model/fds.model.js';

export class LineBuilder extends BaseBuilder<ILine> {
  public withPageNumber = this.withValueFor('pageNumber');
  public withStartBox = this.withValueFor('startBox');
  public withEndBox = this.withValueFor('endBox');
  public withTexts = this.withValueFor('texts');

  protected getDefaultValues(): ILine {
    return {
      pageNumber: 1,
      startBox: { xPositionProportion: 0, yPositionProportion: 0 },
      texts: [],
    };
  }
}
