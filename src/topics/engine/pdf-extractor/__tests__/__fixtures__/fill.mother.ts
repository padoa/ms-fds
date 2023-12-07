import { PAGE_HEIGHT, PAGE_WIDTH } from '@topics/engine/__fixtures__/fixtures.constants.js';
import { FillBuilder } from '@topics/engine/pdf-extractor/__tests__/__fixtures__/fill.builder.js';
import { FILL_MAX_WIDTH_IN_PROPORTION } from '@topics/engine/pdf-extractor/pdf-stroke-extractor.config.js';

export const aFill = (): FillBuilder => new FillBuilder();

export const aFillTooWide = (): FillBuilder =>
  aFill()
    .withW(2 * FILL_MAX_WIDTH_IN_PROPORTION * PAGE_WIDTH)
    .withH(2 * FILL_MAX_WIDTH_IN_PROPORTION * PAGE_HEIGHT);
