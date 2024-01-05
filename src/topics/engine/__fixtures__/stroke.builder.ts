import { BaseBuilder } from '@padoa/meta';

import { POSITION_PROPORTION_X, POSITION_PROPORTION_Y } from '@topics/engine/__fixtures__/fixtures.constants.js';
import type { PositionBuilder } from '@topics/engine/__fixtures__/position.builder.js';
import { aPosition } from '@topics/engine/__fixtures__/position.mother.js';
import { RAW_STROKE_MAX_WIDTH_IN_PROPORTION } from '@topics/engine/pdf-extractor/pdf-stroke-extractor.config.js';

export type ISourceStrokeProperties = { startBox: PositionBuilder; endBox: PositionBuilder };

export class StrokeBuilder extends BaseBuilder<ISourceStrokeProperties> {
  public withStartBox = this.withBuilderFor('startBox');
  public withEndBox = this.withBuilderFor('endBox');

  protected getDefaultValues(): ISourceStrokeProperties {
    return {
      startBox: aPosition(),
      endBox: aPosition()
        .withXPositionProportion(POSITION_PROPORTION_X + RAW_STROKE_MAX_WIDTH_IN_PROPORTION)
        .withYPositionProportion(POSITION_PROPORTION_Y + RAW_STROKE_MAX_WIDTH_IN_PROPORTION),
    };
  }
}
