import { BaseBuilder } from '@padoa/meta';

import type { ISubsection } from '@topics/engine/model/fds.model.js';

export class SubSectionBuilder extends BaseBuilder<ISubsection> {
  public withXPositionProportion = this.withValueFor('xPositionProportion');
  public withYPositionProportion = this.withValueFor('yPositionProportion');
  public withLines = this.withValueFor('lines');

  protected getDefaultValues(): ISubsection {
    return {
      xPositionProportion: 0,
      yPositionProportion: 0,
      lines: [],
    };
  }
}
