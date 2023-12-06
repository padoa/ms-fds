import { BoxBuilder } from '@topics/engine/fixtures/box.builder.js';
import { INCREMENT_VALUE, POSITION_PROPORTION_X, POSITION_PROPORTION_Y } from '@topics/engine/fixtures/fixtures.constants.js';

export const aBox = (): BoxBuilder => new BoxBuilder();

export const aBoxWithPosition = (): BoxBuilder =>
  aBox().withXPositionProportion(POSITION_PROPORTION_X).withYPositionProportion(POSITION_PROPORTION_Y);
export const aBoxWithPositionXIncremented = (): BoxBuilder => buildBoxWithPositionIncrementedTimes(1, 0);
export const aBoxWithPositionYIncremented = (): BoxBuilder => buildBoxWithPositionIncrementedTimes(0, 1);
export const aBoxWithPositionXYIncremented = (): BoxBuilder => buildBoxWithPositionIncrementedTimes(1, 1);
export const aBoxWithPositionYIncrementedTwice = (): BoxBuilder => buildBoxWithPositionIncrementedTimes(0, 2);

const buildBoxWithPositionIncrementedTimes = (multiplyXBy: number, multiplyYBy: number): BoxBuilder =>
  aBox()
    .withXPositionProportion(POSITION_PROPORTION_X + multiplyXBy * INCREMENT_VALUE)
    .withYPositionProportion(POSITION_PROPORTION_Y + multiplyYBy * INCREMENT_VALUE);
