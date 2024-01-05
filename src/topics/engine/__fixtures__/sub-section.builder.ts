import { BaseBuilder } from '@padoa/meta';

import type { LineBuilder } from '@topics/engine/__fixtures__/line.builder.js';
import type { PositionBuilder } from '@topics/engine/__fixtures__/position.builder.js';
import { aPosition } from '@topics/engine/__fixtures__/position.mother.js';
import type { StrokeBuilder } from '@topics/engine/__fixtures__/stroke.builder.js';

export type ISourceSubSectionProperties = { startBox: PositionBuilder; endBox?: PositionBuilder; lines: LineBuilder[]; strokes: StrokeBuilder[] };

export class SubSectionBuilder extends BaseBuilder<ISourceSubSectionProperties> {
  public withStartBox = this.withBuilderFor('startBox');
  public withEndBox = this.withBuilderFor('endBox');
  public withLines = this.withBuilderArrayFor('lines');
  public withStrokes = this.withBuilderArrayFor('strokes');

  protected getDefaultValues(): ISourceSubSectionProperties {
    return {
      startBox: aPosition(),
      lines: [],
      strokes: [],
    };
  }
}
