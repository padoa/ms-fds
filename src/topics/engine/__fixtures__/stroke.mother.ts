import { POSITION_PROPORTION_X, POSITION_PROPORTION_Y } from '@topics/engine/__fixtures__/fixtures.constants.js';
import { aPosition } from '@topics/engine/__fixtures__/position.mother.js';
import { StrokeBuilder } from '@topics/engine/__fixtures__/stroke.builder.js';
import { FILL_MAX_WIDTH_IN_PROPORTION } from '@topics/engine/pdf-extractor/pdf-stroke-extractor.config.js';

export const aStroke = (): StrokeBuilder => new StrokeBuilder();

export const aStrokeEndingAtFillMaxWidth = (): StrokeBuilder =>
  aStroke().withEndBox(
    aPosition()
      .withXPositionProportion(POSITION_PROPORTION_X + FILL_MAX_WIDTH_IN_PROPORTION)
      .withYPositionProportion(POSITION_PROPORTION_Y + FILL_MAX_WIDTH_IN_PROPORTION).properties,
  );
