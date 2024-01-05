import { LineBuilder } from '@topics/engine/__fixtures__/line.builder.js';
import { aPositionWithYIncremented, aPositionWithYIncrementedTwice } from '@topics/engine/__fixtures__/position.mother.js';
import {
  aTextWithCasNumber,
  aTextWithCeNumber,
  aTextWithContentAndPosition,
  aTextWithContentAndPositionXIncremented,
  aTextWithContentAndPositionXYIncremented,
  aTextWithContentAndPositionXYIncrementedTwice,
  aTextWithContentAndPositionYIncremented,
  aTextWithContentAndPositionYIncrementedTwice,
  aTextWithEuhDanger,
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
  aTextWithWarningNoticeIdentifier,
  aTextWithWarningNoticeValue,
} from '@topics/engine/__fixtures__/text.mother.js';

export const aLine = (): LineBuilder => new LineBuilder();

//----------------------------------------------------------------------------------------------
//----------------------------------------- BASICS ---------------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithUndefinedText = (): LineBuilder => aLine().withTexts(undefined);
export const aLineWithOneText = (): LineBuilder => aLine().withTexts([aTextWithContentAndPosition()]);
export const aLineWithTwoTexts = (): LineBuilder => aLine().withTexts([aTextWithContentAndPosition(), aTextWithContentAndPositionXIncremented()]);

//----------------------------------------------------------------------------------------------
//----------------------------------------- POSITIONS ------------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithPositionYIncremented = (): LineBuilder => aLine().withStartBox(aPositionWithYIncremented());
export const aLineWithPositionYIncrementedTwice = (): LineBuilder => aLine().withStartBox(aPositionWithYIncrementedTwice());

export const aLineWithOneTextAndPositionYIncremented = (): LineBuilder =>
  aLineWithPositionYIncremented().withTexts([aTextWithContentAndPositionYIncremented()]);
export const aLineWithTwoTextsAndPositionYIncremented = (): LineBuilder =>
  aLineWithPositionYIncremented().withTexts([aTextWithContentAndPositionYIncremented(), aTextWithContentAndPositionXYIncremented()]);

export const aLineWithOneTextAndPositionYIncrementedTwice = (): LineBuilder =>
  aLineWithPositionYIncrementedTwice().withTexts([aTextWithContentAndPositionYIncrementedTwice()]);
export const aLineWithTwoTextsAndPositionYIncrementedTwice = (): LineBuilder =>
  aLineWithPositionYIncrementedTwice().withTexts([aTextWithContentAndPositionYIncrementedTwice(), aTextWithContentAndPositionXYIncrementedTwice()]);

//----------------------------------------------------------------------------------------------
//----------------------------------------- PRODUCT_NAME ---------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithProductIdentifierOnly = (): LineBuilder => aLine().withTexts([aTextWithProductNameIdentifier()]);
export const aLineWithProductNameOnly = (): LineBuilder => aLine().withTexts([aTextWithProductName()]);
export const aLineWithProductIn1Text = (): LineBuilder => aLine().withTexts([aTextWithProductIdentifierWithColonAndName()]);
export const aLineWithProductIn2Texts = (): LineBuilder => aLine().withTexts([aTextWithProductNameIdentifierWithColon(), aTextWithProductName()]);

//----------------------------------------------------------------------------------------------
//----------------------------------------- PRODUCER_NAME --------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithProducerIdentifierOnlyWithColon = (): LineBuilder => aLine().withTexts([aTextWithProducerIdentifierWithColon()]);
export const aLineWithProducerIdentifierOnly = (): LineBuilder => aLine().withTexts([aTextWithProducerIdentifier()]);
export const aLineWithProducerNameOnly = (): LineBuilder => aLine().withTexts([aTextWithProducerName()]);
export const aLineWithProducerIn1Text = (): LineBuilder => aLine().withTexts([aTextWithProducerIdentifierAndName()]);
export const aLineWithProducerIn2Texts = (): LineBuilder => aLine().withTexts([aTextWithProducerIdentifierWithColon(), aTextWithProducerName()]);
export const aLineWithProducerWithDotIn1Text = (): LineBuilder => aLine().withTexts([aTextWithProducerNameWithDot()]);
export const aLineWithProducerEndingWithDotIn1Text = (): LineBuilder => aLine().withTexts([aTextWithProducerNameEndingWithDot()]);

//----------------------------------------------------------------------------------------------
//----------------------------------------- DANGERS --------------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithHDanger = (): LineBuilder => aLine().withTexts([aTextWithHDanger()]);
export const aLineWithEuhDanger = (): LineBuilder => aLine().withTexts([aTextWithEuhDanger()]);
export const aLineWithMultiplePDanger = (): LineBuilder => aLine().withTexts([aTextWithMultiplePDanger()]);

export const aLineWithTwoDangers = (): LineBuilder => aLine().withTexts([aTextWithHDanger(), aTextWithPDanger()]);
export const aLineWithThreeDangersAndTheirDetails = (): LineBuilder =>
  aLine().withTexts([aTextWithHDangerWithDetails(), aTextWithDangerWithDetails(), aTextWithMultiplePDangerWithDetails()]);

//----------------------------------------------------------------------------------------------
//----------------------------------------- SUBSTANCES -----------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithCasNumber = (): LineBuilder => aLine().withTexts([aTextWithCasNumber()]);
export const aLineWithCeNumber = (): LineBuilder => aLine().withTexts([aTextWithCeNumber()]);
export const aLineWithCasAndCeNumberIn2Texts = (): LineBuilder => aLine().withTexts([aTextWithCasNumber(), aTextWithCeNumber()]);

//----------------------------------------------------------------------------------------------
//--------------------------------------- PHYSICAL_STATE ---------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithPhysicalStateIdentifier = (): LineBuilder => aLine().withTexts([aTextWithPhysicalStateIdentifier()]);
export const aLineWithPhysicalStateValue = (): LineBuilder => aLine().withTexts([aTextWithPhysicalStateValue()]);
export const aLineWithPhysicalStateIdentifierAndValue = (): LineBuilder =>
  aLine().withTexts([aTextWithPhysicalStateIdentifier(), aTextWithPhysicalStateValue()]);

//----------------------------------------------------------------------------------------------
//--------------------------------------- VAPOR_PRESSURE ---------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithVaporPressureIdentifierAndValue = (): LineBuilder =>
  aLine().withTexts([aTextWithVaporPressureIdentifierWithTemperature(), aTextWithVaporPressureValue()]);

//----------------------------------------------------------------------------------------------
//--------------------------------------- BOILING_POINT ----------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithBoilingPointIdentifierAndValue = (): LineBuilder =>
  aLine().withTexts([aTextWithBoilingPointIdentifier(), aTextWithBoilingPointValue()]);

//----------------------------------------------------------------------------------------------
//----------------------------------------- WARNING_NOTICE -------------------------------------
//----------------------------------------------------------------------------------------------

export const aLineWithWarningNoticeIdentifier = (): LineBuilder => aLine().withTexts([aTextWithWarningNoticeIdentifier()]);
export const aLineWithWarningNoticeValue = (): LineBuilder => aLine().withTexts([aTextWithWarningNoticeValue()]);
export const aLineWithWarningNoticeIdentifierAndValue = (): LineBuilder =>
  aLine().withTexts([aTextWithWarningNoticeIdentifier(), aTextWithWarningNoticeValue()]);
