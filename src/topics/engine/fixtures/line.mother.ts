import {
  aBoxWithPosition,
  aBoxWithPositionXIncremented,
  aBoxWithPositionYIncremented,
  aBoxWithPositionYIncrementedTwice,
} from '@topics/engine/fixtures/box.mother.js';
import { LineBuilder } from '@topics/engine/fixtures/line.builder.js';
import {
  aTextWithCASNumber,
  aTextWithCENumber,
  aTextWithContentAndPosition,
  aTextWithContentAndPositionXIncremented,
  aTextWithContentAndPositionXYIncremented,
  aTextWithContentAndPositionXYIncrementedTwice,
  aTextWithContentAndPositionYIncremented,
  aTextWithContentAndPositionYIncrementedTwice,
  aTextWithOneEUHHazard,
  aTextWithOneHHazard,
  aTextWithOneHHazardWithDetails,
  aTextWithOnePHazard,
  aTextWithOnePHazardWithDetails,
  aTextWithOnePPHazard,
  aTextWithOnePPHazardWithDetails,
  aTextWithProducerDetection,
  aTextWithProducerDetectionAndName,
  aTextWithProducerName,
  aTextWithProducerNameEndingWithDot,
  aTextWithProducerNameWithDot,
  aTextWithProductDetectionAndName,
  aTextWithProductName,
  aTextWithProductNameDetection,
  aTextWithProductNameDetectionWithoutColon,
} from '@topics/engine/fixtures/text.mother.js';

export const aLine = (): LineBuilder => new LineBuilder();

/*
 ** BASICS
 */
export const aLineWithOneText = (): LineBuilder => aLineWithPosition().withTexts([aTextWithContentAndPosition().properties]);
export const aLineWithTwoTexts = (): LineBuilder =>
  aLineWithPosition().withTexts([aTextWithContentAndPosition().properties, aTextWithContentAndPositionXIncremented().properties]);

/*
 ** POSITIONS
 */
export const aLineWithPosition = (): LineBuilder => aLine().withStartBox(aBoxWithPosition().properties);
export const aLineWithPositionXIncremented = (): LineBuilder => aLine().withStartBox(aBoxWithPositionXIncremented().properties);
export const aLineWithPositionYIncremented = (): LineBuilder => aLine().withStartBox(aBoxWithPositionYIncremented().properties);
export const aLineWithPositionYIncrementedTwice = (): LineBuilder => aLine().withStartBox(aBoxWithPositionYIncrementedTwice().properties);

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

/*
 ** PRODUCT NAME
 */
export const aLineWithProductDetectionOnly = (): LineBuilder => aLineWithPosition().withTexts([aTextWithProductNameDetection().properties]);
export const aLineWithProductDetectionWithoutColonOnly = (): LineBuilder =>
  aLineWithPosition().withTexts([aTextWithProductNameDetectionWithoutColon().properties]);
export const aLineWithProductNameOnly = (): LineBuilder => aLineWithPosition().withTexts([aTextWithProductName().properties]);
export const aLineWithProductIn1Text = (): LineBuilder => aLineWithPosition().withTexts([aTextWithProductDetectionAndName().properties]);
export const aLineWithProductIn2Texts = (): LineBuilder =>
  aLineWithPosition().withTexts([aTextWithProductNameDetection().properties, aTextWithProductName().properties]);

/*
 ** PRODUCER NAME
 */
export const aLineWithProducerDetectionOnly = (): LineBuilder => aLineWithPosition().withTexts([aTextWithProducerDetection().properties]);
export const aLineWithProducerNameOnly = (): LineBuilder => aLineWithPosition().withTexts([aTextWithProducerName().properties]);
export const aLineWithProducerIn1Text = (): LineBuilder => aLineWithPosition().withTexts([aTextWithProducerDetectionAndName().properties]);
export const aLineWithProducerIn2Texts = (): LineBuilder =>
  aLineWithPosition().withTexts([aTextWithProducerDetection().properties, aTextWithProducerName().properties]);
export const aLineWithProducerWithDotIn1Text = (): LineBuilder => aLineWithPosition().withTexts([aTextWithProducerNameWithDot().properties]);
export const aLineWithProducerEndingWithDotIn1Text = (): LineBuilder =>
  aLineWithPosition().withTexts([aTextWithProducerNameEndingWithDot().properties]);

/*
 ** HAZARDS
 */
export const aLineWithOneHHazard = (): LineBuilder => aLineWithPosition().withTexts([aTextWithOneHHazard().properties]);
export const aLineWithOneEUHHazard = (): LineBuilder => aLineWithPosition().withTexts([aTextWithOneEUHHazard().properties]);
export const aLineWithOnePHazard = (): LineBuilder => aLineWithPosition().withTexts([aTextWithOnePHazard().properties]);
export const aLineWithOnePPazard = (): LineBuilder => aLineWithPosition().withTexts([aTextWithOnePPHazard().properties]);
export const aLineWithTwoHazards = (): LineBuilder =>
  aLineWithPosition().withTexts([aTextWithOneHHazard().properties, aTextWithOnePHazard().properties]);
export const aLineWithThreeHazardsWithDetails = (): LineBuilder =>
  aLineWithPosition().withTexts([
    aTextWithOneHHazardWithDetails().properties,
    aTextWithOnePHazardWithDetails().properties,
    aTextWithOnePPHazardWithDetails().properties,
  ]);

/*
 ** SUBSTANCES
 */
export const aLineWithCASNumber = (): LineBuilder => aLineWithPosition().withTexts([aTextWithCASNumber().properties]);
export const aLineWithCENumber = (): LineBuilder => aLineWithPosition().withTexts([aTextWithCENumber().properties]);
export const aLineWithCASAndCENumberIn2Texts = (): LineBuilder =>
  aLineWithPosition().withTexts([aTextWithCASNumber().properties, aTextWithCENumber().properties]);
