import { BaseBuilder } from '@padoa/meta';

import type { SectionBuilder } from '@topics/engine/__fixtures__/section.builder.js';

export type ISourceFdsTreeProperties = { [section: number]: SectionBuilder };

export class FdsTreeBuilder extends BaseBuilder<ISourceFdsTreeProperties> {
  public withSection1 = this.withBuilderFor(1);
  public withSection2 = this.withBuilderFor(2);
  public withSection3 = this.withBuilderFor(3);
  public withSection9 = this.withBuilderFor(9);

  protected getDefaultValues(): ISourceFdsTreeProperties {
    return {};
  }
}
