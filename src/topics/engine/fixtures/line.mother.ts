import { aBoxWithPosition, aBoxWithPositionYIncremented, aBoxWithPositionYIncrementedTwice } from '@topics/engine/fixtures/box.mother.js';
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
  aTextWithOEUHDanger,
  aTextWithHDanger,
  aTextWithHDangerWithDetails,
  aTextWithPDanger,
  aTextWithDangerWithDetails,
  aTextWithMultiplePDanger,
  aTextWithMultiplePDangerWithDetails,
  aTextWithProducerIdentifierWithColon,
  aTextWithProducerIdentifierAndName,
  aTextWithProducerName,
  aTextWithProducerNameEndingWithDot,
  aTextWithProducerNameWithDot,
  aTextWithProductIdentifierWithColonAndName,
  aTextWithProductName,
  aTextWithProductNameIdentifierWithColon,
  aTextWithProductNameIdentifier,
  aTextWithPhysicalStateIdentifier,
  aTextWithPhysicalStateValue,
  aTextWithProducerIdentifier,
} from '@topics/engine/fixtures/text.mother.js';

export const aLine = (): LineBuilder => new LineBuilder();

//----------------------------------------------------------------------------------------------
//----------------------------------------- BASICS ---------------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithUndefinedText = (): LineBuilder => aLine().withTexts(undefined);
export const aLineWithOneText = (): LineBuilder => aLineWithPosition().withTexts([aTextWithContentAndPosition().properties]);
export const aLineWithTwoTexts = (): LineBuilder =>
  aLineWithPosition().withTexts([aTextWithContentAndPosition().properties, aTextWithContentAndPositionXIncremented().properties]);

//----------------------------------------------------------------------------------------------
//----------------------------------------- POSITIONS ------------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithPosition = (): LineBuilder => aLine().withStartBox(aBoxWithPosition().properties);
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

export const aLineWithProductIdentifierOnly = (): LineBuilder => aLineWithPosition().withTexts([aTextWithProductNameIdentifier().properties]);
export const aLineWithProductNameOnly = (): LineBuilder => aLineWithPosition().withTexts([aTextWithProductName().properties]);
export const aLineWithProductIn1Text = (): LineBuilder => aLineWithPosition().withTexts([aTextWithProductIdentifierWithColonAndName().properties]);
export const aLineWithProductIn2Texts = (): LineBuilder =>
  aLineWithPosition().withTexts([aTextWithProductNameIdentifierWithColon().properties, aTextWithProductName().properties]);

//----------------------------------------------------------------------------------------------
//----------------------------------------- PRODUCER NAME --------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithProducerIdentifierOnlyWithColon = (): LineBuilder =>
  aLineWithPosition().withTexts([aTextWithProducerIdentifierWithColon().properties]);
export const aLineWithProducerIdentifierOnly = (): LineBuilder => aLineWithPosition().withTexts([aTextWithProducerIdentifier().properties]);
export const aLineWithProducerNameOnly = (): LineBuilder => aLineWithPosition().withTexts([aTextWithProducerName().properties]);
export const aLineWithProducerIn1Text = (): LineBuilder => aLineWithPosition().withTexts([aTextWithProducerIdentifierAndName().properties]);
export const aLineWithProducerIn2Texts = (): LineBuilder =>
  aLineWithPosition().withTexts([aTextWithProducerIdentifierWithColon().properties, aTextWithProducerName().properties]);
export const aLineWithProducerWithDotIn1Text = (): LineBuilder => aLineWithPosition().withTexts([aTextWithProducerNameWithDot().properties]);
export const aLineWithProducerEndingWithDotIn1Text = (): LineBuilder =>
  aLineWithPosition().withTexts([aTextWithProducerNameEndingWithDot().properties]);

//----------------------------------------------------------------------------------------------
//----------------------------------------- DANGERS --------------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithHDanger = (): LineBuilder => aLineWithPosition().withTexts([aTextWithHDanger().properties]);
export const aLineWithEUHDanger = (): LineBuilder => aLineWithPosition().withTexts([aTextWithOEUHDanger().properties]);
export const aLineWithMultiplePDanger = (): LineBuilder => aLineWithPosition().withTexts([aTextWithMultiplePDanger().properties]);

export const aLineWithTwoDangers = (): LineBuilder => aLineWithPosition().withTexts([aTextWithHDanger().properties, aTextWithPDanger().properties]);
export const aLineWithThreeDangersAndTheirDetails = (): LineBuilder =>
  aLineWithPosition().withTexts([
    aTextWithHDangerWithDetails().properties,
    aTextWithDangerWithDetails().properties,
    aTextWithMultiplePDangerWithDetails().properties,
  ]);

//----------------------------------------------------------------------------------------------
//----------------------------------------- SUBSTANCES -----------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithCASNumber = (): LineBuilder => aLineWithPosition().withTexts([aTextWithCASNumber().properties]);
export const aLineWithCENumber = (): LineBuilder => aLineWithPosition().withTexts([aTextWithCENumber().properties]);
export const aLineWithCASAndCENumberIn2Texts = (): LineBuilder =>
  aLineWithPosition().withTexts([aTextWithCASNumber().properties, aTextWithCENumber().properties]);

//----------------------------------------------------------------------------------------------
//--------------------------------------- PHYSICAL_STATE ---------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithPhysicalStateIdentifier = (): LineBuilder => aLineWithPosition().withTexts([aTextWithPhysicalStateIdentifier().properties]);
export const aLineWithPhysicalStateValue = (): LineBuilder => aLineWithPosition().withTexts([aTextWithPhysicalStateValue().properties]);
export const aLineWithPhysicalStateIdentifierAndValue = (): LineBuilder =>
  aLineWithPosition().withTexts([aTextWithPhysicalStateIdentifier().properties, aTextWithPhysicalStateValue().properties]);
