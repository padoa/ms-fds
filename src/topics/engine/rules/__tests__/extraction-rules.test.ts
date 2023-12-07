import { describe, expect, it } from 'vitest';

import {
  CASNumberRegex,
  CENumberRegex,
  applyExtractionRules,
  getDangers,
  getProducer,
  getProduct,
  getProductByLineOrder,
  getProductByText,
  getSubstances,
} from '@topics/engine/rules/extraction-rules.js';
import type {
  IBox,
  IExtractedData,
  IExtractedDanger,
  IExtractedProducer,
  IExtractedProduct,
  IExtractedSubstance,
  IFDSTree,
  IMetaData,
} from '@topics/engine/model/fds.model.js';
import {
  aFdsTree,
  aFdsTreeWithAllSectionsWithUsefulInfo,
  aFdsTreeWithAllSectionsWithoutUsefulInfo,
  anEmptyFdsTreeWithAllSections,
} from '@topics/engine/__fixtures__/fds-tree.mother.js';
import {
  POSITION_PROPORTION_X,
  POSITION_PROPORTION_Y,
  PRODUCT_NAME,
  PRODUCT_IDENTIFIER_WITH_COLON,
  PLACEHOLDER_TEXT_1,
  PLACEHOLDER_TEXT_2,
  PLACEHOLDER_TEXT_3,
  TEXT_CONTENT,
  PRODUCER_NAME,
  PRODUCER_NAME_WITH_DOT,
  H_DANGER,
  EUH_DANGER,
  P_DANGER,
  MULTIPLE_P_DANGER,
  CAS_NUMBER,
  CE_NUMBER,
  PRODUCER_IDENTIFIER_WITH_COLON,
  CAS_NUMBER_TEXT,
  CE_NUMBER_TEXT,
  H_DANGER_WITH_DETAILS,
  MULTIPLE_P_DANGER_WITH_DETAILS,
  PHYSICAL_STATE_VALUE,
  PRODUCT_IDENTIFIER,
} from '@topics/engine/__fixtures__/fixtures.constants.js';
import {
  aLine,
  aLineWithCASAndCENumberIn2Texts,
  aLineWithCASNumber,
  aLineWithCENumber,
  aLineWithEUHDanger,
  aLineWithHDanger,
  aLineWithMultiplePDanger,
  aLineWithOneText,
  aLineWithProducerIdentifierOnlyWithColon,
  aLineWithProducerEndingWithDotIn1Text,
  aLineWithProducerIn1Text,
  aLineWithProducerIn2Texts,
  aLineWithProducerNameOnly,
  aLineWithProducerWithDotIn1Text,
  aLineWithProductIdentifierOnly,
  aLineWithProductIn1Text,
  aLineWithProductIn2Texts,
  aLineWithProductNameOnly,
  aLineWithTwoDangers,
  aLineWithUndefinedText,
  aLineWithProducerIdentifierOnly,
} from '@topics/engine/__fixtures__/line.mother.js';
import { aSection } from '@topics/engine/__fixtures__/section.mother.js';
import { aSubSection, aSubSectionWith3LinesContainingProductName } from '@topics/engine/__fixtures__/sub-section.mother.js';
import { aTextWithRandomContent1, aTextWithRandomContent2, aTextWithRandomContent3 } from '@topics/engine/__fixtures__/text.mother.js';

describe('ExtractionRules tests', () => {
  const iBox: IBox = { xPositionProportion: POSITION_PROPORTION_X, yPositionProportion: POSITION_PROPORTION_Y };
  const metaData: IMetaData = { pageNumber: 1, startBox: iBox, endBox: undefined };

  describe('Regexps tests', () => {
    describe('CASNumberRegex tests', () => {
      it.each<[{ input: string; expected: boolean }]>([
        [{ input: '1234567-12-3', expected: true }],
        [{ input: '9876543-45-6', expected: true }],
        [{ input: '111-22-3', expected: true }],
        [{ input: '987-65-4', expected: true }],
        [{ input: '1-23-4', expected: true }],
        [{ input: '-1234567-12-3', expected: false }],
        [{ input: '1234567-12-3-', expected: false }],
        [{ input: '12-34567-12-3', expected: false }],
        [{ input: '1234567-123-3', expected: false }],
        [{ input: '1234567-12-3-4', expected: false }],
        [{ input: 'abc-12-34', expected: false }],
        [{ input: '12-34-def', expected: false }],
        [{ input: '12-34-56789', expected: false }],
        [{ input: '12-34', expected: false }],
        [{ input: '12-34-', expected: false }],
      ])('$input payload should return $expected', ({ input, expected }) => {
        expect(new RegExp(CASNumberRegex).test(input)).toEqual(expected);
      });
    });

    describe('CENumberRegex tests', () => {
      it.each<[{ input: string; expected: boolean }]>([
        [{ input: '123-456-7', expected: true }],
        [{ input: '987-654-3', expected: true }],
        [{ input: '111-222-3', expected: true }],
        [{ input: '987-654-3', expected: true }],
        [{ input: '1-234-5', expected: false }],
        [{ input: '1-23-456-7', expected: false }],
        [{ input: '123-456-78', expected: false }],
        [{ input: 'abc-123-456', expected: false }],
        [{ input: '123-abc-456', expected: false }],
        [{ input: '123-456-', expected: false }],
      ])('$input payload should return $expected', ({ input, expected }) => {
        expect(new RegExp(CENumberRegex).test(input)).toEqual(expected);
      });
    });
  });

  describe('Product Name rules tests', () => {
    describe('GetProductByText tests', () => {
      it.each<[{ message: string; fdsTree: IFDSTree; expected: IExtractedProduct | null }]>([
        [
          {
            message: 'should return null when providing a fdsTree with an undefined text',
            fdsTree: aFdsTree().withSection1(
              aSection().withSubsections({
                1: aSubSection().withLines([aLineWithUndefinedText().properties]).properties,
              }).properties,
            ).properties,
            expected: null,
          },
        ],
        [
          {
            message: 'should return null when providing a fdsTree with all subsections but all empty',
            fdsTree: anEmptyFdsTreeWithAllSections().properties,
            expected: null,
          },
        ],
        [
          {
            message: 'should return null when providing a fdsTree with all subsections filled without product name',
            fdsTree: aFdsTreeWithAllSectionsWithoutUsefulInfo().properties,
            expected: null,
          },
        ],
        [
          {
            message: 'should return product name when it is contained in 1 text',
            fdsTree: aFdsTree().withSection1(
              aSection().withSubsections({ 1: aSubSection().withLines([aLineWithProductIn1Text().properties]).properties }).properties,
            ).properties,
            expected: { name: PRODUCT_NAME, metaData },
          },
        ],
        [
          {
            message: 'should return product name when it is contained in 2 different texts of same line',
            fdsTree: aFdsTree().withSection1(
              aSection().withSubsections({ 1: aSubSection().withLines([aLineWithProductIn2Texts().properties]).properties }).properties,
            ).properties,
            expected: { name: PRODUCT_NAME, metaData },
          },
        ],
      ])('$message', ({ fdsTree, expected }) => {
        expect(getProductByText(fdsTree)).toEqual(expected);
      });
    });

    describe('GetProductByLineOrder tests', () => {
      it.each<[{ message: string; fdsTree: IFDSTree; fullText: string; expected: IExtractedProduct | null }]>([
        [
          {
            message: 'should return null when providing a fdsTree with an undefined text',
            fdsTree: aFdsTree().withSection1(
              aSection().withSubsections({
                1: aSubSection().withLines([aLineWithUndefinedText().properties]).properties,
              }).properties,
            ).properties,
            fullText: '',
            expected: null,
          },
        ],
        [
          {
            message: 'should return null when providing a fdsTree with all subsections but all empty',
            fdsTree: anEmptyFdsTreeWithAllSections().properties,
            fullText: '',
            expected: null,
          },
        ],
        [
          {
            message: 'should return null when providing a fdsTree with all subsections filled without product name',
            fdsTree: aFdsTree().withSection1(
              aSection().withSubsections({
                1: aSubSection().withLines([
                  aLine().withTexts([aTextWithRandomContent1().properties, aTextWithRandomContent2().properties]).properties,
                  aLine().withTexts([aTextWithRandomContent3().properties]).properties,
                ]).properties,
              }).properties,
            ).properties,
            fullText: `${PLACEHOLDER_TEXT_1}${PLACEHOLDER_TEXT_2}${PLACEHOLDER_TEXT_3}`,
            expected: null,
          },
        ],
        [
          {
            message: 'should skip lines containing only product identifier',
            fdsTree: aFdsTree().withSection1(
              aSection().withSubsections({
                1: aSubSection().withLines([aLineWithProductIdentifierOnly().properties]).properties,
              }).properties,
            ).properties,
            fullText: PRODUCT_IDENTIFIER,
            expected: null,
          },
        ],
        [
          {
            message: 'should return null when product name only appears twice in fullText',
            fdsTree: aFdsTree().withSection1(
              aSection().withSubsections({
                1: aSubSection().withLines([
                  aLineWithOneText().properties,
                  aLineWithProductNameOnly().properties,
                  aLineWithProductNameOnly().properties,
                ]).properties,
              }).properties,
            ).properties,
            fullText: `${TEXT_CONTENT}${PRODUCT_NAME}${PRODUCT_NAME}`,
            expected: null,
          },
        ],
        [
          {
            message: 'should return product name when it appears three times in fullText',
            fdsTree: aFdsTree().withSection1(
              aSection().withSubsections({
                1: aSubSectionWith3LinesContainingProductName().properties,
              }).properties,
            ).properties,
            fullText: `${PRODUCT_NAME.repeat(3)}`,
            expected: { name: PRODUCT_NAME, metaData },
          },
        ],
        [
          {
            message: 'should skip first line containing product identifier and return product name when it appears three times in fullText',
            fdsTree: aFdsTree().withSection1(
              aSection().withSubsections({
                1: aSubSection().withLines([
                  aLineWithProductIdentifierOnly().properties,
                  aLineWithProductNameOnly().properties,
                  aLineWithProductNameOnly().properties,
                  aLineWithProductNameOnly().properties,
                ]).properties,
              }).properties,
            ).properties,
            fullText: `${PRODUCT_IDENTIFIER}${PRODUCT_NAME.repeat(3)}`,
            expected: { name: PRODUCT_NAME, metaData },
          },
        ],
      ])('$message', ({ fdsTree, fullText, expected }) => {
        expect(getProductByLineOrder(fdsTree, { fullText })).toEqual(expected);
      });
    });

    describe('GetProduct tests', () => {
      it.each<[{ message: string; fdsTree: IFDSTree; fullText: string; expected: IExtractedProduct | null }]>([
        [
          {
            message: 'it should return null when providing an empty fdsTree',
            fdsTree: anEmptyFdsTreeWithAllSections().properties,
            fullText: '',
            expected: null,
          },
        ],
        // enters getProductByText
        [
          {
            message: 'it should return product name when identifier is in one line and product in another line',
            fdsTree: aFdsTree().withSection1(
              aSection().withSubsections({
                1: aSubSection().withLines([aLineWithProductIdentifierOnly().properties, aLineWithProductNameOnly().properties]).properties,
              }).properties,
            ).properties,
            fullText: `${PRODUCT_IDENTIFIER_WITH_COLON}${PRODUCT_NAME}`,
            expected: { name: PRODUCT_NAME, metaData },
          },
        ],
        // enters getProductByLineOrder
        [
          {
            message: 'should return product name when it appears three times or more in fullText',
            fdsTree: aFdsTree().withSection1(
              aSection().withSubsections({
                1: aSubSectionWith3LinesContainingProductName().properties,
              }).properties,
            ).properties,
            fullText: `${PRODUCT_NAME.repeat(3)}`,
            expected: { name: PRODUCT_NAME, metaData },
          },
        ],
      ])('$message', ({ fdsTree, fullText, expected }) => {
        expect(getProduct(fdsTree, { fullText })).toEqual(expected);
      });
    });
  });

  describe('Producer rules tests', () => {
    describe('GetProducer tests', () => {
      it.each<[{ message: string; fdsTree: IFDSTree; expected: IExtractedProducer | null }]>([
        [
          {
            message: 'should return null when providing a fdsTree with an undefined text',
            fdsTree: aFdsTree().withSection1(
              aSection().withSubsections({
                3: aSubSection().withLines([aLineWithUndefinedText().properties]).properties,
              }).properties,
            ).properties,
            expected: null,
          },
        ],
        [{ message: 'it should return null when providing an empty fdsTree', fdsTree: anEmptyFdsTreeWithAllSections().properties, expected: null }],
        [
          {
            message: 'should skip lines containing only producer identifier',
            fdsTree: aFdsTree().withSection1(
              aSection().withSubsections({
                3: aSubSection().withLines([aLineWithProducerIdentifierOnly().properties]).properties,
              }).properties,
            ).properties,
            expected: null,
          },
        ],
        [
          {
            message: 'it should return producer name when providing a line with producer in 1 text',
            fdsTree: aFdsTree().withSection1(
              aSection().withSubsections({
                3: aSubSection().withLines([aLineWithProducerIn1Text().properties]).properties,
              }).properties,
            ).properties,
            expected: { name: PRODUCER_NAME, metaData },
          },
        ],
        [
          {
            message: 'it should skip first line containing producer identifer and return producer name when providing a line with producer in 1 text',
            fdsTree: aFdsTree().withSection1(
              aSection().withSubsections({
                3: aSubSection().withLines([aLineWithProducerIdentifierOnly().properties, aLineWithProducerIn1Text().properties]).properties,
              }).properties,
            ).properties,
            expected: { name: PRODUCER_NAME, metaData },
          },
        ],
        [
          {
            message: 'it should return producer name when providing a line with producer in 2 texts',
            fdsTree: aFdsTree().withSection1(
              aSection().withSubsections({
                3: aSubSection().withLines([aLineWithProducerIn2Texts().properties]).properties,
              }).properties,
            ).properties,
            expected: { name: PRODUCER_NAME, metaData },
          },
        ],
        [
          {
            message: 'it should return producer name when providing producer in 2 lines',
            fdsTree: aFdsTree().withSection1(
              aSection().withSubsections({
                3: aSubSection().withLines([aLineWithProducerIdentifierOnlyWithColon().properties, aLineWithProducerNameOnly().properties])
                  .properties,
              }).properties,
            ).properties,
            expected: { name: PRODUCER_NAME, metaData },
          },
        ],
        // entering cleanProducer
        [
          {
            message: 'it should return producer name when providing producer ending with dot',
            fdsTree: aFdsTree().withSection1(
              aSection().withSubsections({
                3: aSubSection().withLines([aLineWithProducerEndingWithDotIn1Text().properties]).properties,
              }).properties,
            ).properties,
            expected: { name: PRODUCER_NAME, metaData },
          },
        ],
        [
          {
            message: 'it should return producer name when providing producer ending with dot',
            fdsTree: aFdsTree().withSection1(
              aSection().withSubsections({
                3: aSubSection().withLines([aLineWithProducerWithDotIn1Text().properties]).properties,
              }).properties,
            ).properties,
            expected: { name: PRODUCER_NAME_WITH_DOT, metaData },
          },
        ],
      ])('$message', ({ fdsTree, expected }) => {
        expect(getProducer(fdsTree)).toEqual(expected);
      });
    });
  });

  describe('Dangers rules tests', () => {
    describe('GetDangers tests', () => {
      it.each<[{ message: string; fdsTree: IFDSTree; expected: IExtractedDanger[] }]>([
        [{ message: 'it should return null when providing an empty fdsTree', fdsTree: anEmptyFdsTreeWithAllSections().properties, expected: [] }],
        [
          {
            message: 'it should return an empty list when providing texts without dangers',
            fdsTree: aFdsTreeWithAllSectionsWithoutUsefulInfo().properties,
            expected: [],
          },
        ],
        [
          {
            message: 'it should retrieve dangers contained in lines',
            fdsTree: aFdsTree().withSection2(
              aSection().withSubsections({
                2: aSubSection().withLines([aLineWithHDanger().properties, aLineWithEUHDanger().properties]).properties,
              }).properties,
            ).properties,
            expected: [H_DANGER, EUH_DANGER],
          },
        ],
        [
          {
            message: 'it should retrieve dangers contained in texts and lines',
            fdsTree: aFdsTree().withSection2(
              aSection().withSubsections({
                2: aSubSection().withLines([aLineWithTwoDangers().properties, aLineWithMultiplePDanger().properties]).properties,
              }).properties,
            ).properties,
            expected: [H_DANGER, P_DANGER, MULTIPLE_P_DANGER],
          },
        ],
      ])('$message', ({ fdsTree, expected }) => {
        expect(getDangers(fdsTree)).toEqual(expected);
      });
    });
  });

  describe('Substances rules tests', () => {
    describe('GetSubstances tests', () => {
      it.each<[{ message: string; fdsTree: IFDSTree; expected: IExtractedSubstance[] }]>([
        [
          {
            message: 'it should return an empty list when given an empty fdsTree',
            fdsTree: anEmptyFdsTreeWithAllSections().properties,
            expected: [],
          },
        ],
        [
          {
            message: 'it should return an empty list when given a text without cas nor ce number',
            fdsTree: aFdsTreeWithAllSectionsWithoutUsefulInfo().properties,
            expected: [],
          },
        ],
        [
          {
            message: 'it should return cas and ce number when it is contained in 2 texts',
            fdsTree: aFdsTree().withSection3(
              aSection().withSubsections({
                1: aSubSection().withLines([aLineWithCASAndCENumberIn2Texts().properties]).properties,
              }).properties,
            ).properties,
            expected: [{ casNumber: CAS_NUMBER, ceNumber: CE_NUMBER }],
          },
        ],
        [
          {
            message: 'it should return ce number even when cas number is missing',
            fdsTree: aFdsTree().withSection3(
              aSection().withSubsections({
                1: aSubSection().withLines([aLineWithCENumber().properties]).properties,
              }).properties,
            ).properties,
            expected: [{ casNumber: undefined, ceNumber: CE_NUMBER }],
          },
        ],
        [
          {
            message: 'it should return ce number even when it is contained in 2 lines',
            fdsTree: aFdsTree().withSection3(
              aSection().withSubsections({
                1: aSubSection().withLines([aLineWithCASNumber().properties, aLineWithCENumber().properties]).properties,
              }).properties,
            ).properties,
            expected: [{ casNumber: CAS_NUMBER, ceNumber: CE_NUMBER }],
          },
        ],
        [
          {
            message: 'it should return cas number even when it is contained in 2 lines',
            fdsTree: aFdsTree().withSection3(
              aSection().withSubsections({
                1: aSubSection().withLines([aLineWithCENumber().properties, aLineWithCASNumber().properties]).properties,
              }).properties,
            ).properties,
            expected: [{ casNumber: CAS_NUMBER, ceNumber: CE_NUMBER }],
          },
        ],
      ])('$message', ({ fdsTree, expected }) => {
        expect(getSubstances(fdsTree)).toEqual(expected);
      });
    });
  });

  describe('ApplyExtractionRules tests', () => {
    it('Should extract all fields from fds', async () => {
      const fullText: string = `
      révision : 18/05/2015
      ${PRODUCT_IDENTIFIER_WITH_COLON}
      ${PRODUCT_NAME}
      ${PRODUCER_IDENTIFIER_WITH_COLON}
      ${PRODUCER_NAME}
      ${H_DANGER_WITH_DETAILS}
      ${MULTIPLE_P_DANGER_WITH_DETAILS}
      ${MULTIPLE_P_DANGER}
      ${CAS_NUMBER_TEXT}
      ${CE_NUMBER_TEXT}
    `;

      const expected: IExtractedData = {
        date: { formattedDate: '2015/05/18', inTextDate: '18/05/2015' },
        product: { name: PRODUCT_NAME, metaData },
        producer: { name: PRODUCER_NAME, metaData },
        dangers: [H_DANGER, P_DANGER, MULTIPLE_P_DANGER],
        substances: [{ casNumber: CAS_NUMBER, ceNumber: CE_NUMBER }],
        physicalState: { value: PHYSICAL_STATE_VALUE, metaData },
      };

      await expect(applyExtractionRules({ fdsTreeCleaned: aFdsTreeWithAllSectionsWithUsefulInfo().properties, fullText })).resolves.toEqual(expected);
    });
  });
});
