import { PAGE_HEIGHT, PAGE_WIDTH } from '@topics/engine/__fixtures__/fixtures.constants.js';
import { RawStrokeBuilder } from '@topics/engine/pdf-extractor/__tests__/__fixtures__/raw-stroke.builder.js';
import { RAW_STROKE_MAX_WIDTH_IN_PROPORTION } from '@topics/engine/pdf-extractor/pdf-stroke-extractor.config.js';

export const aRawStroke = (): RawStrokeBuilder => new RawStrokeBuilder();

export const aHorizontalRawStroke = (): RawStrokeBuilder => aRawStroke();
export const aVerticalRawStroke = (): RawStrokeBuilder =>
  aRawStroke()
    .withW(RAW_STROKE_MAX_WIDTH_IN_PROPORTION * PAGE_WIDTH)
    .withL(RAW_STROKE_MAX_WIDTH_IN_PROPORTION * PAGE_HEIGHT);

export const aRawStrokeTooWide = (): RawStrokeBuilder => aRawStroke().withW(2 * RAW_STROKE_MAX_WIDTH_IN_PROPORTION * PAGE_HEIGHT);
