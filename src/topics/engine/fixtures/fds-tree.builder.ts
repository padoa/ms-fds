import { BaseBuilder } from '@padoa/meta';

import type { IFDSTree } from '@topics/engine/model/fds.model.js';

export class FDSTreeBuilder extends BaseBuilder<IFDSTree> {
  public withSection1 = this.withValueFor(1);
  public withSection2 = this.withValueFor(2);
  public withSection3 = this.withValueFor(3);

  protected getDefaultValues(): IFDSTree {
    return {};
  }
}
