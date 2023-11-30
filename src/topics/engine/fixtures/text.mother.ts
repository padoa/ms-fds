import { INCREMENT_VALUE, POSITION_X, POSITION_Y, TEXT_CONTENT } from '@topics/engine/fixtures/fixtures.constants.js';
import { TextBuilder } from '@topics/engine/fixtures/text.builder.js';

export const aText = (): TextBuilder => new TextBuilder();

export const aTextWithContent = (): TextBuilder => aText().withContent(TEXT_CONTENT);

export const aTextWithContentAndPosition = (): TextBuilder => buildTextWithContentAndPositionIncrementedTimes(0, 0);
export const aTextWithContentAndPositionXIncremented = (): TextBuilder => buildTextWithContentAndPositionIncrementedTimes(1, 0);
export const aTextWithContentAndPositionYIncremented = (): TextBuilder => buildTextWithContentAndPositionIncrementedTimes(0, 1);
export const aTextWithContentAndPositionXYIncremented = (): TextBuilder => buildTextWithContentAndPositionIncrementedTimes(1, 1);
export const aTextWithContentAndPositionXIncrementedTwice = (): TextBuilder => buildTextWithContentAndPositionIncrementedTimes(2, 0);
export const aTextWithContentAndPositionYIncrementedTwice = (): TextBuilder => buildTextWithContentAndPositionIncrementedTimes(0, 2);
export const aTextWithContentAndPositionXYIncrementedTwice = (): TextBuilder => buildTextWithContentAndPositionIncrementedTimes(2, 2);

const buildTextWithContentAndPositionIncrementedTimes = (multiplyXBy: number, multiplyYBy: number): TextBuilder =>
  aText()
    .withContent(TEXT_CONTENT)
    .withXPositionProportion(POSITION_X + multiplyXBy * INCREMENT_VALUE)
    .withYPositionProportion(POSITION_Y + multiplyYBy * INCREMENT_VALUE);
