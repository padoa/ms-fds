import {
  INCREMENT_VALUE,
  POSITION_PROPORTION_X,
  POSITION_PROPORTION_Y,
  H_DANGER,
  EUH_DANGER,
  P_DANGER,
  MULTIPLE_P_DANGER,
  CAS_NUMBER_TEXT,
  CE_NUMBER_TEXT,
  H_DANGER_WITH_DETAILS,
  P_DANGER_WITH_DETAILS,
  MULTIPLE_P_DANGER_WITH_DETAILS,
  VAPOR_PRESSURE_IDENTIFIER_WITH_TEMPERATURE,
  VAPOR_PRESSURE_VALUE,
  VAPOR_PRESSURE_IDENTIFIER,
  BOILING_POINT_IDENTIFIER,
  BOILING_POINT_VALUE,
  CONCENTRATION_VALUE,
  RAW_PLACEHOLDER_TEXT_1,
  RAW_PLACEHOLDER_TEXT_2,
  RAW_PLACEHOLDER_TEXT_3,
  RAW_TEXT_CONTENT,
  RAW_PRODUCT_IDENTIFIER_WITH_COLON,
  RAW_PRODUCT_IDENTIFIER,
  RAW_PRODUCT_NAME,
  RAW_PHYSICAL_STATE_IDENTIFIER,
  RAW_PHYSICAL_STATE_VALUE,
  RAW_PRODUCER_IDENTIFIER_WITH_COLON,
  RAW_PRODUCER_NAME,
  RAW_PRODUCER_NAME_WITH_DOT,
  RAW_PRODUCER_NAME_ENDING_WITH_DOT,
  RAW_PRODUCER_IDENTIFIER,
} from '@topics/engine/__fixtures__/fixtures.constants.js';
import { TextBuilder } from '@topics/engine/__fixtures__/text.builder.js';

export const aText = (): TextBuilder => new TextBuilder();

//----------------------------------------------------------------------------------------------
//----------------------------------------- BASICS ---------------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithRandomContent1 = (): TextBuilder => aText().withContent(RAW_PLACEHOLDER_TEXT_1);
export const aTextWithRandomContent2 = (): TextBuilder => aText().withContent(RAW_PLACEHOLDER_TEXT_2);
export const aTextWithRandomContent3 = (): TextBuilder => aText().withContent(RAW_PLACEHOLDER_TEXT_3);
export const aTextWithPosition = (): TextBuilder =>
  aText().withXPositionProportion(POSITION_PROPORTION_X).withYPositionProportion(POSITION_PROPORTION_Y);

//----------------------------------------------------------------------------------------------
//----------------------------------------- POSITIONS ------------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithContentAndPosition = (): TextBuilder => buildTextWithContentAndPositionIncrementedTimes(0, 0);
export const aTextWithContentAndPositionXIncremented = (): TextBuilder => buildTextWithContentAndPositionIncrementedTimes(1, 0);
export const aTextWithContentAndPositionYIncremented = (): TextBuilder => buildTextWithContentAndPositionIncrementedTimes(0, 1);
export const aTextWithContentAndPositionXYIncremented = (): TextBuilder => buildTextWithContentAndPositionIncrementedTimes(1, 1);
export const aTextWithContentAndPositionXIncrementedTwice = (): TextBuilder => buildTextWithContentAndPositionIncrementedTimes(2, 0);
export const aTextWithContentAndPositionYIncrementedTwice = (): TextBuilder => buildTextWithContentAndPositionIncrementedTimes(0, 2);
export const aTextWithContentAndPositionXYIncrementedTwice = (): TextBuilder => buildTextWithContentAndPositionIncrementedTimes(2, 2);

const buildTextWithContentAndPositionIncrementedTimes = (multiplyXBy: number, multiplyYBy: number): TextBuilder =>
  aText()
    .withContent(RAW_TEXT_CONTENT)
    .withXPositionProportion(POSITION_PROPORTION_X + multiplyXBy * INCREMENT_VALUE)
    .withYPositionProportion(POSITION_PROPORTION_Y + multiplyYBy * INCREMENT_VALUE);

//----------------------------------------------------------------------------------------------
//----------------------------------------- PRODUCT_NAME ---------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithProductNameIdentifierWithColon = (): TextBuilder => aText().withContent(RAW_PRODUCT_IDENTIFIER_WITH_COLON);
export const aTextWithProductNameIdentifier = (): TextBuilder => aText().withContent(RAW_PRODUCT_IDENTIFIER);
export const aTextWithProductName = (): TextBuilder => aText().withContent(RAW_PRODUCT_NAME);
export const aTextWithProductIdentifierWithColonAndName = (): TextBuilder =>
  aText().withContent(`${RAW_PRODUCT_IDENTIFIER_WITH_COLON}${RAW_PRODUCT_NAME}`);

//----------------------------------------------------------------------------------------------
//----------------------------------------- PRODUCER_NAME --------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithProducerIdentifierWithColon = (): TextBuilder => aText().withContent(RAW_PRODUCER_IDENTIFIER_WITH_COLON);
export const aTextWithProducerIdentifier = (): TextBuilder => aText().withContent(RAW_PRODUCER_IDENTIFIER);
export const aTextWithProducerName = (): TextBuilder => aText().withContent(RAW_PRODUCER_NAME);
export const aTextWithProducerNameWithDot = (): TextBuilder => aText().withContent(RAW_PRODUCER_NAME_WITH_DOT);
export const aTextWithProducerNameEndingWithDot = (): TextBuilder => aText().withContent(RAW_PRODUCER_NAME_ENDING_WITH_DOT);
export const aTextWithProducerIdentifierAndName = (): TextBuilder => aText().withContent(`${RAW_PRODUCER_IDENTIFIER_WITH_COLON}${RAW_PRODUCER_NAME}`);

//----------------------------------------------------------------------------------------------
//----------------------------------------- DANGERS --------------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithHDanger = (): TextBuilder => aText().withCleanContent(H_DANGER);
export const aTextWithEuhDanger = (): TextBuilder => aText().withCleanContent(EUH_DANGER);
export const aTextWithPDanger = (): TextBuilder => aText().withCleanContent(P_DANGER);
export const aTextWithMultiplePDanger = (): TextBuilder => aText().withCleanContent(MULTIPLE_P_DANGER);

export const aTextWithHDangerWithDetails = (): TextBuilder => aText().withCleanContent(H_DANGER_WITH_DETAILS);
export const aTextWithDangerWithDetails = (): TextBuilder => aText().withCleanContent(P_DANGER_WITH_DETAILS);
export const aTextWithMultiplePDangerWithDetails = (): TextBuilder => aText().withCleanContent(MULTIPLE_P_DANGER_WITH_DETAILS);

//----------------------------------------------------------------------------------------------
//----------------------------------------- SUBSTANCES -----------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithCasNumber = (): TextBuilder => aText().withCleanContent(CAS_NUMBER_TEXT);
export const aTextWithCeNumber = (): TextBuilder => aText().withCleanContent(CE_NUMBER_TEXT);

//----------------------------------------------------------------------------------------------
//--------------------------------------- CONCENTRATION  ---------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithConcentration = (): TextBuilder => aText().withCleanContent(CONCENTRATION_VALUE);

//----------------------------------------------------------------------------------------------
//--------------------------------------- PHYSICAL_STATE ---------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithPhysicalStateIdentifier = (): TextBuilder => aText().withContent(RAW_PHYSICAL_STATE_IDENTIFIER);
export const aTextWithPhysicalStateValue = (): TextBuilder => aText().withContent(RAW_PHYSICAL_STATE_VALUE);

//----------------------------------------------------------------------------------------------
//--------------------------------------- VAPOR_PRESSURE ---------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithVaporPressureIdentifier = (): TextBuilder => aText().withCleanContent(VAPOR_PRESSURE_IDENTIFIER);
export const aTextWithVaporPressureIdentifierWithTemperature = (): TextBuilder =>
  aText().withCleanContent(VAPOR_PRESSURE_IDENTIFIER_WITH_TEMPERATURE);
export const aTextWithVaporPressureValue = (): TextBuilder => aText().withCleanContent(VAPOR_PRESSURE_VALUE);

//----------------------------------------------------------------------------------------------
//--------------------------------------- BOILING_POINT ----------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithBoilingPointIdentifier = (): TextBuilder => aText().withCleanContent(BOILING_POINT_IDENTIFIER);
export const aTextWithBoilingPointValue = (): TextBuilder => aText().withCleanContent(BOILING_POINT_VALUE);
