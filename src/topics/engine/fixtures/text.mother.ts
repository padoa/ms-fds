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
  PRODUCER_IDENTIFIER,
  PRODUCER_NAME_WITH_DOT,
  PRODUCER_NAME_ENDING_WITH_DOT,
  PRODUCER_NAME,
  H_HAZARD,
  EUH_HAZARD,
  P_HAZARD,
  MULTIPLE_P_HAZARD,
  CAS_NUMBER_TEXT,
  CE_NUMBER_TEXT,
  H_HAZARD_WITH_DETAILS,
  P_HAZARD_WITH_DETAILS,
  MULTIPLE_P_HAZARD_WITH_DETAILS,
  PHYSICAL_STATE_IDENTIFIER,
  PHYSICAL_STATE_VALUE,
} from '@topics/engine/fixtures/fixtures.constants.js';
import { TextBuilder } from '@topics/engine/fixtures/text.builder.js';

export const aText = (): TextBuilder => new TextBuilder();

//----------------------------------------------------------------------------------------------
//----------------------------------------- BASICS ---------------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithContent = (): TextBuilder => aText().withContent(TEXT_CONTENT);
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

export const aTextWithProducerIdentifier = (): TextBuilder => aText().withContent(PRODUCER_IDENTIFIER);
export const aTextWithProducerName = (): TextBuilder => aText().withContent(PRODUCER_NAME);
export const aTextWithProducerNameWithDot = (): TextBuilder => aText().withContent(PRODUCER_NAME_WITH_DOT);
export const aTextWithProducerNameEndingWithDot = (): TextBuilder => aText().withContent(PRODUCER_NAME_ENDING_WITH_DOT);
export const aTextWithProducerIdentifierAndName = (): TextBuilder => aText().withContent(`${PRODUCER_IDENTIFIER}${PRODUCER_NAME}`);

//----------------------------------------------------------------------------------------------
//----------------------------------------- HAZARDS --------------------------------------------
//----------------------------------------------------------------------------------------------

export const aTextWithHHazard = (): TextBuilder => aText().withContent(H_HAZARD);
export const aTextWithOEUHHazard = (): TextBuilder => aText().withContent(EUH_HAZARD);
export const aTextWithPHazard = (): TextBuilder => aText().withContent(P_HAZARD);
export const aTextWithMultiplePHazard = (): TextBuilder => aText().withContent(MULTIPLE_P_HAZARD);

export const aTextWithHHazardWithDetails = (): TextBuilder => aText().withContent(H_HAZARD_WITH_DETAILS);
export const aTextWithHazardWithDetails = (): TextBuilder => aText().withContent(P_HAZARD_WITH_DETAILS);
export const aTextWithMultiplePHazardWithDetails = (): TextBuilder => aText().withContent(MULTIPLE_P_HAZARD_WITH_DETAILS);

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
