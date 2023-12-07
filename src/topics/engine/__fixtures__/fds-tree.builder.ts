import { BaseBuilder } from '@padoa/meta';

import type { IFdsTree } from '@topics/engine/model/fds.model.js';

export class FdsTreeBuilder extends BaseBuilder<IFdsTree> {
  public withSection1 = this.withValueFor(1);
  public withSection2 = this.withValueFor(2);
  public withSection3 = this.withValueFor(3);
  public withSection9 = this.withValueFor(9);

  protected getDefaultValues(): IFdsTree {
    return {};
  }
}
