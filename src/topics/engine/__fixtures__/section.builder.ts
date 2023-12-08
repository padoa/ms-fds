import { BaseBuilder } from '@padoa/meta';

import { POSITION_PROPORTION_X, POSITION_PROPORTION_Y } from '@topics/engine/__fixtures__/fixtures.constants.js';
import type { ISection } from '@topics/engine/model/fds.model.js';

export class SectionBuilder extends BaseBuilder<ISection> {
  public withStartBox = this.withValueFor('startBox');
  public withEndBox = this.withValueFor('endBox');
  public withSubsections = this.withValueFor('subsections');

  protected getDefaultValues(): ISection {
    return {
      startBox: { pageNumber: 1, xPositionProportion: POSITION_PROPORTION_X, yPositionProportion: POSITION_PROPORTION_Y },
      subsections: {},
    };
  }
}
