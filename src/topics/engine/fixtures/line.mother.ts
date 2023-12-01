import {
  aBoxWithPosition,
  aBoxWithPositionXIncremented,
  aBoxWithPositionYIncremented,
  aBoxWithPositionYIncrementedTwice,
} from '@topics/engine/fixtures/box.mother.js';
import { LineBuilder } from '@topics/engine/fixtures/line.builder.js';
import {
  aTextWithContentAndPosition,
  aTextWithContentAndPositionXIncremented,
  aTextWithContentAndPositionXYIncremented,
  aTextWithContentAndPositionXYIncrementedTwice,
  aTextWithContentAndPositionYIncremented,
  aTextWithContentAndPositionYIncrementedTwice,
} from '@topics/engine/fixtures/text.mother.js';

export const aLine = (): LineBuilder => new LineBuilder();

// TODO: add endBox ?
export const aLineWithPosition = (): LineBuilder => aLine().withStartBox(aBoxWithPosition().properties);
export const aLineWithPositionXIncremented = (): LineBuilder => aLine().withStartBox(aBoxWithPositionXIncremented().properties);
export const aLineWithPositionYIncremented = (): LineBuilder => aLine().withStartBox(aBoxWithPositionYIncremented().properties);
export const aLineWithPositionYIncrementedTwice = (): LineBuilder => aLine().withStartBox(aBoxWithPositionYIncrementedTwice().properties);

export const aLineWithOneText = (): LineBuilder => aLineWithPosition().withTexts([aTextWithContentAndPosition().properties]);
export const aLineWithTwoTexts = (): LineBuilder =>
  aLineWithPosition().withTexts([aTextWithContentAndPosition().properties, aTextWithContentAndPositionXIncremented().properties]);

export const aLineWithOneTextAndPositionYIncremented = (): LineBuilder =>
  aLineWithPositionYIncremented().withTexts([aTextWithContentAndPositionYIncremented().properties]);
export const aLineWithTwoTextsAndPositionYIncremented = (): LineBuilder =>
  aLineWithPositionYIncremented().withTexts([
    aTextWithContentAndPositionYIncremented().properties,
    aTextWithContentAndPositionXYIncremented().properties,
  ]);

export const aLineWithOneTextAndPositionYIncrementedTwice = (): LineBuilder =>
  aLineWithPositionYIncrementedTwice().withTexts([aTextWithContentAndPositionYIncrementedTwice().properties]);
export const aLineWithTwoTextsAndPositionYIncrementedTwice = (): LineBuilder =>
  aLineWithPositionYIncrementedTwice().withTexts([
    aTextWithContentAndPositionYIncrementedTwice().properties,
    aTextWithContentAndPositionXYIncrementedTwice().properties,
  ]);
