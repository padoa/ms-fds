import { BaseBuilder } from '@padoa/meta';

import type { IBox } from '@topics/engine/model/fds.model.js';

export class BoxBuilder extends BaseBuilder<IBox> {
  public withXPositionProportion = this.withValueFor('xPositionProportion');
  public withYPositionProportion = this.withValueFor('yPositionProportion');

  protected getDefaultValues(): IBox {
    return {
      xPositionProportion: 0,
      yPositionProportion: 0,
    };
  }
}
