import {
  INCREMENT_VALUE,
  POSITION_PROPORTION_X,
  POSITION_PROPORTION_Y,
  CLEAN_PRODUCT_NAME,
  CLEAN_PRODUCT_IDENTIFIER_WITH_COLON,
  CLEAN_PRODUCT_IDENTIFIER,
  CLEAN_PLACEHOLDER_TEXT_1,
  CLEAN_PLACEHOLDER_TEXT_2,
  CLEAN_PLACEHOLDER_TEXT_3,
  CLEAN_TEXT_CONTENT,
  PRODUCER_IDENTIFIER_WITH_COLON,
  PRODUCER_NAME_WITH_DOT,
  PRODUCER_NAME_ENDING_WITH_DOT,
  PRODUCER_NAME,
  H_DANGER,
  EUH_DANGER,
  P_DANGER,
  MULTIPLE_P_DANGER,
  CAS_NUMBER_TEXT,
  CE_NUMBER_TEXT,
  H_DANGER_WITH_DETAILS,
  P_DANGER_WITH_DETAILS,
  MULTIPLE_P_DANGER_WITH_DETAILS,
  CLEAN_PHYSICAL_STATE_IDENTIFIER,
  CLEAN_PHYSICAL_STATE_VALUE,
  PRODUCER_IDENTIFIER,
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
} from '@topics/engine/__fixtures__/fixtures.constants.js';
import { TextBuilder } from '@topics/engine/__fixtures__/text.builder.js';

export const aText = (): TextBuilder => new TextBuilder();

//----------------------------------------------------------------------------------------------
//----------------------------------------- BASICS ---------------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithRandomContent1 = (): TextBuilder => aText().withRawContent(RAW_PLACEHOLDER_TEXT_1).withCleanContent(CLEAN_PLACEHOLDER_TEXT_1);
export const aTextWithRandomContent2 = (): TextBuilder => aText().withRawContent(RAW_PLACEHOLDER_TEXT_2).withCleanContent(CLEAN_PLACEHOLDER_TEXT_2);
export const aTextWithRandomContent3 = (): TextBuilder => aText().withRawContent(RAW_PLACEHOLDER_TEXT_3).withCleanContent(CLEAN_PLACEHOLDER_TEXT_3);
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
    .withRawContent(RAW_TEXT_CONTENT)
    .withCleanContent(CLEAN_TEXT_CONTENT)
    .withXPositionProportion(POSITION_PROPORTION_X + multiplyXBy * INCREMENT_VALUE)
    .withYPositionProportion(POSITION_PROPORTION_Y + multiplyYBy * INCREMENT_VALUE);

//----------------------------------------------------------------------------------------------
//----------------------------------------- PRODUCT_NAME ---------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithProductNameIdentifierWithColon = (): TextBuilder =>
  aText().withRawContent(RAW_PRODUCT_IDENTIFIER_WITH_COLON).withCleanContent(CLEAN_PRODUCT_IDENTIFIER_WITH_COLON);
export const aTextWithProductNameIdentifier = (): TextBuilder =>
  aText().withRawContent(RAW_PRODUCT_IDENTIFIER).withCleanContent(CLEAN_PRODUCT_IDENTIFIER);
export const aTextWithProductName = (): TextBuilder => aText().withRawContent(RAW_PRODUCT_NAME).withCleanContent(CLEAN_PRODUCT_NAME);
export const aTextWithProductIdentifierWithColonAndName = (): TextBuilder =>
  aText()
    .withRawContent(`${RAW_PRODUCT_IDENTIFIER_WITH_COLON}${RAW_PRODUCT_NAME}`)
    .withCleanContent(`${CLEAN_PRODUCT_IDENTIFIER_WITH_COLON}${CLEAN_PRODUCT_NAME}`);

//----------------------------------------------------------------------------------------------
//----------------------------------------- PRODUCER_NAME --------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithProducerIdentifierWithColon = (): TextBuilder => aText().withCleanContent(PRODUCER_IDENTIFIER_WITH_COLON);
export const aTextWithProducerIdentifier = (): TextBuilder => aText().withCleanContent(PRODUCER_IDENTIFIER);
export const aTextWithProducerName = (): TextBuilder => aText().withCleanContent(PRODUCER_NAME);
export const aTextWithProducerNameWithDot = (): TextBuilder => aText().withCleanContent(PRODUCER_NAME_WITH_DOT);
export const aTextWithProducerNameEndingWithDot = (): TextBuilder => aText().withCleanContent(PRODUCER_NAME_ENDING_WITH_DOT);
export const aTextWithProducerIdentifierAndName = (): TextBuilder => aText().withCleanContent(`${PRODUCER_IDENTIFIER_WITH_COLON}${PRODUCER_NAME}`);

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

export const aTextWithPhysicalStateIdentifier = (): TextBuilder =>
  aText().withRawContent(RAW_PHYSICAL_STATE_IDENTIFIER).withCleanContent(CLEAN_PHYSICAL_STATE_IDENTIFIER);
export const aTextWithPhysicalStateValue = (): TextBuilder =>
  aText().withRawContent(RAW_PHYSICAL_STATE_VALUE).withCleanContent(CLEAN_PHYSICAL_STATE_VALUE);

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
