import { INCREMENT_VALUE, POSITION_PROPORTION_X, POSITION_PROPORTION_Y } from '@topics/engine/__fixtures__/fixtures.constants.js';
import { PositionBuilder } from '@topics/engine/__fixtures__/position.builder.js';

export const aPosition = (): PositionBuilder => new PositionBuilder();

export const aPositionWithYIncremented = (): PositionBuilder => buildBoxWithPositionIncrementedTimes(0, 1);
export const aPositionWithYIncrementedTwice = (): PositionBuilder => buildBoxWithPositionIncrementedTimes(0, 2);

const buildBoxWithPositionIncrementedTimes = (multiplyXBy: number, multiplyYBy: number): PositionBuilder =>
  aPosition()
    .withXPositionProportion(POSITION_PROPORTION_X + multiplyXBy * INCREMENT_VALUE)
    .withYPositionProportion(POSITION_PROPORTION_Y + multiplyYBy * INCREMENT_VALUE);
