import { BaseBuilder } from '@padoa/meta';

import type { ISection } from '@topics/engine/model/fds.model.js';

export class SectionBuilder extends BaseBuilder<ISection> {
  public withXPositionProportion = this.withValueFor('xPositionProportion');
  public withYPositionProportion = this.withValueFor('yPositionProportion');
  public withSubsections = this.withValueFor('subsections');

  protected getDefaultValues(): ISection {
    return {
      xPositionProportion: 0,
      yPositionProportion: 0,
      subsections: {},
    };
  }
}
