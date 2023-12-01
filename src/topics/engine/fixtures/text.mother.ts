import {
  INCREMENT_VALUE,
  POSITION_X,
  POSITION_Y,
  PRODUCT_NAME,
  PRODUCT_DETECTION,
  PRODUCT_DETECTION_WITHOUT_COLON,
  PLACEHOLDER_TEXT_1,
  PLACEHOLDER_TEXT_2,
  PLACEHOLDER_TEXT_3,
  TEXT_CONTENT,
  PRODUCER_DETECTION,
  PRODUCER_NAME_WITH_DOT,
  PRODUCER_NAME_ENDING_WITH_DOT,
  PRODUCER_NAME,
  H_HAZARD,
  EUH_HAZARD,
  P_HAZARD,
  PP_HAZARD,
  CAS_NUMBER_TEXT,
  CE_NUMBER_TEXT,
  H_HAZARD_WITH_DETAILS,
  P_HAZARD_WITH_DETAILS,
  PP_HAZARD_WITH_DETAILS,
} from '@topics/engine/fixtures/fixtures.constants.js';
import { TextBuilder } from '@topics/engine/fixtures/text.builder.js';

export const aText = (): TextBuilder => new TextBuilder();

/*
 ** BASICS
 */
export const aTextWithContent = (): TextBuilder => aText().withContent(TEXT_CONTENT);
export const aTextWithRandomContent1 = (): TextBuilder => aText().withContent(PLACEHOLDER_TEXT_1);
export const aTextWithRandomContent2 = (): TextBuilder => aText().withContent(PLACEHOLDER_TEXT_2);
export const aTextWithRandomContent3 = (): TextBuilder => aText().withContent(PLACEHOLDER_TEXT_3);

/*
 ** POSITIONS
 */
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
    .withXPositionProportion(POSITION_X + multiplyXBy * INCREMENT_VALUE)
    .withYPositionProportion(POSITION_Y + multiplyYBy * INCREMENT_VALUE);

/*
 ** PRODUCT NAME
 */
export const aTextWithProductNameDetection = (): TextBuilder => aText().withContent(PRODUCT_DETECTION);
export const aTextWithProductNameDetectionWithoutColon = (): TextBuilder => aText().withContent(PRODUCT_DETECTION_WITHOUT_COLON);
export const aTextWithProductName = (): TextBuilder => aText().withContent(PRODUCT_NAME);
export const aTextWithProductDetectionAndName = (): TextBuilder => aText().withContent(`${PRODUCT_DETECTION}${PRODUCT_NAME}`);

/*
 ** PRODUCER NAME
 */
export const aTextWithProducerDetection = (): TextBuilder => aText().withContent(PRODUCER_DETECTION);
export const aTextWithProducerName = (): TextBuilder => aText().withContent(PRODUCER_NAME);
export const aTextWithProducerNameWithDot = (): TextBuilder => aText().withContent(PRODUCER_NAME_WITH_DOT);
export const aTextWithProducerNameEndingWithDot = (): TextBuilder => aText().withContent(PRODUCER_NAME_ENDING_WITH_DOT);
export const aTextWithProducerDetectionAndName = (): TextBuilder => aText().withContent(`${PRODUCER_DETECTION}${PRODUCER_NAME}`);

/*
 ** HAZARDS
 */
export const aTextWithOneHHazard = (): TextBuilder => aText().withContent(H_HAZARD);
export const aTextWithOneEUHHazard = (): TextBuilder => aText().withContent(EUH_HAZARD);
export const aTextWithOnePHazard = (): TextBuilder => aText().withContent(P_HAZARD);
export const aTextWithOnePPHazard = (): TextBuilder => aText().withContent(PP_HAZARD);

export const aTextWithOneHHazardWithDetails = (): TextBuilder => aText().withContent(H_HAZARD_WITH_DETAILS);
export const aTextWithOnePHazardWithDetails = (): TextBuilder => aText().withContent(P_HAZARD_WITH_DETAILS);
export const aTextWithOnePPHazardWithDetails = (): TextBuilder => aText().withContent(PP_HAZARD_WITH_DETAILS);

/*
 ** SUBSTANCES
 */
export const aTextWithCASNumber = (): TextBuilder => aText().withContent(CAS_NUMBER_TEXT);
export const aTextWithCENumber = (): TextBuilder => aText().withContent(CE_NUMBER_TEXT);
