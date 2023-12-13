import { LineBuilder } from '@topics/engine/__fixtures__/line.builder.js';
import { aPositionWithYIncremented, aPositionWithYIncrementedTwice } from '@topics/engine/__fixtures__/position.mother.js';
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
  aTextWithVaporPressureIdentifierWithTemperature,
  aTextWithVaporPressureValue,
  aTextWithBoilingPointIdentifier,
  aTextWithBoilingPointValue,
  aTextWithConcentration,
} from '@topics/engine/__fixtures__/text.mother.js';

export const aLine = (): LineBuilder => new LineBuilder();

//----------------------------------------------------------------------------------------------
//----------------------------------------- BASICS ---------------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithUndefinedText = (): LineBuilder => aLine().withTexts(undefined);
export const aLineWithOneText = (): LineBuilder => aLine().withTexts([aTextWithContentAndPosition().properties]);
export const aLineWithTwoTexts = (): LineBuilder =>
  aLine().withTexts([aTextWithContentAndPosition().properties, aTextWithContentAndPositionXIncremented().properties]);

//----------------------------------------------------------------------------------------------
//----------------------------------------- POSITIONS ------------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithPositionYIncremented = (): LineBuilder => aLine().withStartBox(aPositionWithYIncremented().properties);
export const aLineWithPositionYIncrementedTwice = (): LineBuilder => aLine().withStartBox(aPositionWithYIncrementedTwice().properties);

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
//----------------------------------------- PRODUCT_NAME ---------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithProductIdentifierOnly = (): LineBuilder => aLine().withTexts([aTextWithProductNameIdentifier().properties]);
export const aLineWithProductNameOnly = (): LineBuilder => aLine().withTexts([aTextWithProductName().properties]);
export const aLineWithProductIn1Text = (): LineBuilder => aLine().withTexts([aTextWithProductIdentifierWithColonAndName().properties]);
export const aLineWithProductIn2Texts = (): LineBuilder =>
  aLine().withTexts([aTextWithProductNameIdentifierWithColon().properties, aTextWithProductName().properties]);

//----------------------------------------------------------------------------------------------
//----------------------------------------- PRODUCER_NAME --------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithProducerIdentifierOnlyWithColon = (): LineBuilder => aLine().withTexts([aTextWithProducerIdentifierWithColon().properties]);
export const aLineWithProducerIdentifierOnly = (): LineBuilder => aLine().withTexts([aTextWithProducerIdentifier().properties]);
export const aLineWithProducerNameOnly = (): LineBuilder => aLine().withTexts([aTextWithProducerName().properties]);
export const aLineWithProducerIn1Text = (): LineBuilder => aLine().withTexts([aTextWithProducerIdentifierAndName().properties]);
export const aLineWithProducerIn2Texts = (): LineBuilder =>
  aLine().withTexts([aTextWithProducerIdentifierWithColon().properties, aTextWithProducerName().properties]);
export const aLineWithProducerWithDotIn1Text = (): LineBuilder => aLine().withTexts([aTextWithProducerNameWithDot().properties]);
export const aLineWithProducerEndingWithDotIn1Text = (): LineBuilder => aLine().withTexts([aTextWithProducerNameEndingWithDot().properties]);

//----------------------------------------------------------------------------------------------
//----------------------------------------- DANGERS --------------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithHDanger = (): LineBuilder => aLine().withTexts([aTextWithHDanger().properties]);
export const aLineWithEUHDanger = (): LineBuilder => aLine().withTexts([aTextWithOEUHDanger().properties]);
export const aLineWithMultiplePDanger = (): LineBuilder => aLine().withTexts([aTextWithMultiplePDanger().properties]);

export const aLineWithTwoDangers = (): LineBuilder => aLine().withTexts([aTextWithHDanger().properties, aTextWithPDanger().properties]);
export const aLineWithThreeDangersAndTheirDetails = (): LineBuilder =>
  aLine().withTexts([
    aTextWithHDangerWithDetails().properties,
    aTextWithDangerWithDetails().properties,
    aTextWithMultiplePDangerWithDetails().properties,
  ]);

//----------------------------------------------------------------------------------------------
//----------------------------------------- SUBSTANCES -----------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithCASNumber = (): LineBuilder => aLine().withTexts([aTextWithCASNumber().properties]);
export const aLineWithCENumber = (): LineBuilder => aLine().withTexts([aTextWithCENumber().properties]);
export const aLineWithCASAndCENumberIn2Texts = (): LineBuilder =>
  aLine().withTexts([aTextWithCASNumber().properties, aTextWithCENumber().properties]);
export const aLineWithCASAndCENumberAndConcentrationIn3Texts = (): LineBuilder =>
  aLine().withTexts([aTextWithCASNumber().properties, aTextWithCENumber().properties, aTextWithConcentration().properties]);

//----------------------------------------------------------------------------------------------
//--------------------------------------- PHYSICAL_STATE ---------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithPhysicalStateIdentifier = (): LineBuilder => aLine().withTexts([aTextWithPhysicalStateIdentifier().properties]);
export const aLineWithPhysicalStateValue = (): LineBuilder => aLine().withTexts([aTextWithPhysicalStateValue().properties]);
export const aLineWithPhysicalStateIdentifierAndValue = (): LineBuilder =>
  aLine().withTexts([aTextWithPhysicalStateIdentifier().properties, aTextWithPhysicalStateValue().properties]);

//----------------------------------------------------------------------------------------------
//--------------------------------------- VAPOR_PRESSURE ---------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithVaporPressureIdentifierAndValue = (): LineBuilder =>
  aLine().withTexts([aTextWithVaporPressureIdentifierWithTemperature().properties, aTextWithVaporPressureValue().properties]);

//----------------------------------------------------------------------------------------------
//--------------------------------------- BOILING_POINT ----------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithBoilingPointIdentifierAndValue = (): LineBuilder =>
  aLine().withTexts([aTextWithBoilingPointIdentifier().properties, aTextWithBoilingPointValue().properties]);
