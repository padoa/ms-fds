import { BaseBuilder } from '@padoa/meta';

import type { PositionBuilder } from '@topics/engine/__fixtures__/position.builder.js';
import { aPosition } from '@topics/engine/__fixtures__/position.mother.js';
import type { SubSectionBuilder } from '@topics/engine/__fixtures__/sub-section.builder.js';

export type ISourceSectionProperties = {
  startBox: PositionBuilder;
  endBox?: PositionBuilder;
  subsections: { [subsection: number]: SubSectionBuilder };
};

export class SectionBuilder extends BaseBuilder<ISourceSectionProperties> {
  public withStartBox = this.withBuilderFor('startBox');
  public withEndBox = this.withBuilderFor('endBox');
  public withSubsections = this.withValueFor('subsections');

  protected getDefaultValues(): ISourceSectionProperties {
    return {
      startBox: aPosition(),
      subsections: null,
    };
  }
}
