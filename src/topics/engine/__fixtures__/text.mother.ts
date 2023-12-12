import {
  INCREMENT_VALUE,
  POSITION_PROPORTION_X,
  POSITION_PROPORTION_Y,
  PRODUCT_NAME,
  PRODUCT_IDENTIFIER_WITH_COLON,
  PRODUCT_IDENTIFIER,
  PLACEHOLDER_TEXT_1,
  PLACEHOLDER_TEXT_2,
  PLACEHOLDER_TEXT_3,
  TEXT_CONTENT,
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
  PHYSICAL_STATE_IDENTIFIER,
  PHYSICAL_STATE_VALUE,
  PRODUCER_IDENTIFIER,
  VAPOR_PRESSURE_IDENTIFIER_WITH_TEMPERATURE,
  VAPOR_PRESSURE_VALUE,
  VAPOR_PRESSURE_IDENTIFIER,
  BOILING_POINT_IDENTIFIER,
  BOILING_POINT_VALUE,
} from '@topics/engine/__fixtures__/fixtures.constants.js';
import { TextBuilder } from '@topics/engine/__fixtures__/text.builder.js';

export const aText = (): TextBuilder => new TextBuilder();

//----------------------------------------------------------------------------------------------
//----------------------------------------- BASICS ---------------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithRandomContent1 = (): TextBuilder => aText().withContent(PLACEHOLDER_TEXT_1);
export const aTextWithRandomContent2 = (): TextBuilder => aText().withContent(PLACEHOLDER_TEXT_2);
export const aTextWithRandomContent3 = (): TextBuilder => aText().withContent(PLACEHOLDER_TEXT_3);
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
    .withContent(TEXT_CONTENT)
    .withXPositionProportion(POSITION_PROPORTION_X + multiplyXBy * INCREMENT_VALUE)
    .withYPositionProportion(POSITION_PROPORTION_Y + multiplyYBy * INCREMENT_VALUE);

//----------------------------------------------------------------------------------------------
//----------------------------------------- PRODUCT NAME ---------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithProductNameIdentifierWithColon = (): TextBuilder => aText().withContent(PRODUCT_IDENTIFIER_WITH_COLON);
export const aTextWithProductNameIdentifier = (): TextBuilder => aText().withContent(PRODUCT_IDENTIFIER);
export const aTextWithProductName = (): TextBuilder => aText().withContent(PRODUCT_NAME);
export const aTextWithProductIdentifierWithColonAndName = (): TextBuilder => aText().withContent(`${PRODUCT_IDENTIFIER_WITH_COLON}${PRODUCT_NAME}`);

//----------------------------------------------------------------------------------------------
//----------------------------------------- PRODUCER NAME --------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithProducerIdentifierWithColon = (): TextBuilder => aText().withContent(PRODUCER_IDENTIFIER_WITH_COLON);
export const aTextWithProducerIdentifier = (): TextBuilder => aText().withContent(PRODUCER_IDENTIFIER);
export const aTextWithProducerName = (): TextBuilder => aText().withContent(PRODUCER_NAME);
export const aTextWithProducerNameWithDot = (): TextBuilder => aText().withContent(PRODUCER_NAME_WITH_DOT);
export const aTextWithProducerNameEndingWithDot = (): TextBuilder => aText().withContent(PRODUCER_NAME_ENDING_WITH_DOT);
export const aTextWithProducerIdentifierAndName = (): TextBuilder => aText().withContent(`${PRODUCER_IDENTIFIER_WITH_COLON}${PRODUCER_NAME}`);

//----------------------------------------------------------------------------------------------
//----------------------------------------- DANGERS --------------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithHDanger = (): TextBuilder => aText().withContent(H_DANGER);
export const aTextWithOEUHDanger = (): TextBuilder => aText().withContent(EUH_DANGER);
export const aTextWithPDanger = (): TextBuilder => aText().withContent(P_DANGER);
export const aTextWithMultiplePDanger = (): TextBuilder => aText().withContent(MULTIPLE_P_DANGER);

export const aTextWithHDangerWithDetails = (): TextBuilder => aText().withContent(H_DANGER_WITH_DETAILS);
export const aTextWithDangerWithDetails = (): TextBuilder => aText().withContent(P_DANGER_WITH_DETAILS);
export const aTextWithMultiplePDangerWithDetails = (): TextBuilder => aText().withContent(MULTIPLE_P_DANGER_WITH_DETAILS);

//----------------------------------------------------------------------------------------------
//----------------------------------------- SUBSTANCES -----------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithCASNumber = (): TextBuilder => aText().withContent(CAS_NUMBER_TEXT);
export const aTextWithCENumber = (): TextBuilder => aText().withContent(CE_NUMBER_TEXT);

//----------------------------------------------------------------------------------------------
//--------------------------------------- PHYSICAL STATE ---------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithPhysicalStateIdentifier = (): TextBuilder => aText().withContent(PHYSICAL_STATE_IDENTIFIER);
export const aTextWithPhysicalStateValue = (): TextBuilder => aText().withContent(PHYSICAL_STATE_VALUE);

//----------------------------------------------------------------------------------------------
//--------------------------------------- VAPOR_PRESSURE ---------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithVaporPressureIdentifier = (): TextBuilder => aText().withContent(VAPOR_PRESSURE_IDENTIFIER);
export const aTextWithVaporPressureIdentifierWithTemperature = (): TextBuilder => aText().withContent(VAPOR_PRESSURE_IDENTIFIER_WITH_TEMPERATURE);
export const aTextWithVaporPressureValue = (): TextBuilder => aText().withContent(VAPOR_PRESSURE_VALUE);

//----------------------------------------------------------------------------------------------
//--------------------------------------- BOILING_POINT ----------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithBoilingPointIdentifier = (): TextBuilder => aText().withContent(BOILING_POINT_IDENTIFIER);
export const aTextWithBoilingPointValue = (): TextBuilder => aText().withContent(BOILING_POINT_VALUE);
