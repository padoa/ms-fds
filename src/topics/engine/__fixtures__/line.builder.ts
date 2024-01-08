import { BaseBuilder } from '@padoa/meta';

import type { PositionBuilder } from '@topics/engine/__fixtures__/position.builder.js';
import { aPosition } from '@topics/engine/__fixtures__/position.mother.js';
import type { TextBuilder } from '@topics/engine/__fixtures__/text.builder.js';

export type ISourceLineProperties = { startBox: PositionBuilder; endBox?: PositionBuilder; texts: TextBuilder[] };

export class LineBuilder extends BaseBuilder<ISourceLineProperties> {
  public withStartBox = this.withBuilderFor('startBox');
  public withEndBox = this.withBuilderFor('endBox');
  public withTexts = this.withBuilderArrayFor('texts');

  protected getDefaultValues(): ISourceLineProperties {
    return {
      startBox: aPosition(),
      texts: [],
    };
  }
}
