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
  aTextWithOEUHHazard,
  aTextWithHHazard,
  aTextWithHHazardWithDetails,
  aTextWithPHazard,
  aTextWithHazardWithDetails,
  aTextWithMultiplePHazard,
  aTextWithMultiplePHazardWithDetails,
  aTextWithProducerIdentifier,
  aTextWithProducerIdentifierAndName,
  aTextWithProducerName,
  aTextWithProducerNameEndingWithDot,
  aTextWithProducerNameWithDot,
  aTextWithProductIdentifierWithColonAndName,
  aTextWithProductName,
  aTextWithProductNameIdentifierWithColon,
  aTextWithProductNameIdentifier,
} from '@topics/engine/fixtures/text.mother.js';

export const aLine = (): LineBuilder => new LineBuilder();

//----------------------------------------------------------------------------------------------
//----------------------------------------- BASICS ---------------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithOneText = (): LineBuilder => aLineWithPosition().withTexts([aTextWithContentAndPosition().properties]);
export const aLineWithTwoTexts = (): LineBuilder =>
  aLineWithPosition().withTexts([aTextWithContentAndPosition().properties, aTextWithContentAndPositionXIncremented().properties]);

//----------------------------------------------------------------------------------------------
//----------------------------------------- POSITIONS ------------------------------------------
//----------------------------------------------------------------------------------------------

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

//----------------------------------------------------------------------------------------------
//----------------------------------------- PRODUCT NAME ---------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithProductIdentifierWithColonOnly = (): LineBuilder =>
  aLineWithPosition().withTexts([aTextWithProductNameIdentifierWithColon().properties]);
export const aLineWithProductIdentifierOnly = (): LineBuilder => aLineWithPosition().withTexts([aTextWithProductNameIdentifier().properties]);
export const aLineWithProductNameOnly = (): LineBuilder => aLineWithPosition().withTexts([aTextWithProductName().properties]);
export const aLineWithProductIn1Text = (): LineBuilder => aLineWithPosition().withTexts([aTextWithProductIdentifierWithColonAndName().properties]);
export const aLineWithProductIn2Texts = (): LineBuilder =>
  aLineWithPosition().withTexts([aTextWithProductNameIdentifierWithColon().properties, aTextWithProductName().properties]);

//----------------------------------------------------------------------------------------------
//----------------------------------------- PRODUCER NAME --------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithProducerIdentifierOnly = (): LineBuilder => aLineWithPosition().withTexts([aTextWithProducerIdentifier().properties]);
export const aLineWithProducerNameOnly = (): LineBuilder => aLineWithPosition().withTexts([aTextWithProducerName().properties]);
export const aLineWithProducerIn1Text = (): LineBuilder => aLineWithPosition().withTexts([aTextWithProducerIdentifierAndName().properties]);
export const aLineWithProducerIn2Texts = (): LineBuilder =>
  aLineWithPosition().withTexts([aTextWithProducerIdentifier().properties, aTextWithProducerName().properties]);
export const aLineWithProducerWithDotIn1Text = (): LineBuilder => aLineWithPosition().withTexts([aTextWithProducerNameWithDot().properties]);
export const aLineWithProducerEndingWithDotIn1Text = (): LineBuilder =>
  aLineWithPosition().withTexts([aTextWithProducerNameEndingWithDot().properties]);

//----------------------------------------------------------------------------------------------
//----------------------------------------- HAZARDS --------------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithHHazard = (): LineBuilder => aLineWithPosition().withTexts([aTextWithHHazard().properties]);
export const aLineWithEUHHazard = (): LineBuilder => aLineWithPosition().withTexts([aTextWithOEUHHazard().properties]);
export const aLineWithPHazard = (): LineBuilder => aLineWithPosition().withTexts([aTextWithPHazard().properties]);
export const aLineWithMultiplePHazard = (): LineBuilder => aLineWithPosition().withTexts([aTextWithMultiplePHazard().properties]);

export const aLineWithTwoHazards = (): LineBuilder => aLineWithPosition().withTexts([aTextWithHHazard().properties, aTextWithPHazard().properties]);
export const aLineWithThreeHazardsAndTheirDetails = (): LineBuilder =>
  aLineWithPosition().withTexts([
    aTextWithHHazardWithDetails().properties,
    aTextWithHazardWithDetails().properties,
    aTextWithMultiplePHazardWithDetails().properties,
  ]);

//----------------------------------------------------------------------------------------------
//----------------------------------------- SUBSTANCES -----------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithCASNumber = (): LineBuilder => aLineWithPosition().withTexts([aTextWithCASNumber().properties]);
export const aLineWithCENumber = (): LineBuilder => aLineWithPosition().withTexts([aTextWithCENumber().properties]);
export const aLineWithCASAndCENumberIn2Texts = (): LineBuilder =>
  aLineWithPosition().withTexts([aTextWithCASNumber().properties, aTextWithCENumber().properties]);
