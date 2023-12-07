import { describe, expect, it } from 'vitest';

import {
  CASNumberRegex,
  CENumberRegex,
  applyExtractionRules,
  getDangers,
  getProducer,
  getSubstances,
} from '@topics/engine/rules/extraction-rules.js';
import type {
  IBox,
  IExtractedData,
  IExtractedDanger,
  IExtractedProducer,
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
} from '@topics/engine/__fixtures__/fixtures.constants.js';
import {
  aLineWithCASAndCENumberIn2Texts,
  aLineWithCASNumber,
  aLineWithCENumber,
  aLineWithEUHDanger,
  aLineWithHDanger,
  aLineWithMultiplePDanger,
  aLineWithProducerIdentifierOnlyWithColon,
  aLineWithProducerEndingWithDotIn1Text,
  aLineWithProducerIn1Text,
  aLineWithProducerIn2Texts,
  aLineWithProducerNameOnly,
  aLineWithProducerWithDotIn1Text,
  aLineWithTwoDangers,
  aLineWithUndefinedText,
  aLineWithProducerIdentifierOnly,
} from '@topics/engine/__fixtures__/line.mother.js';
import { aSection } from '@topics/engine/__fixtures__/section.mother.js';
import { aSubSection } from '@topics/engine/__fixtures__/sub-section.mother.js';

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
