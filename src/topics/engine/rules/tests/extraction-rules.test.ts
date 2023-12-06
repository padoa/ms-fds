import { describe, expect, it } from 'vitest';

import {
  CASNumberRegex,
  CENumberRegex,
  applyExtractionRules,
  englishNumberDateRegex,
  getDate,
  getDateByMostFrequent,
  getDateByMostRecent,
  getDateByRevisionText,
  getHazards,
  getProducer,
  getProduct,
  getProductByLineOrder,
  getProductByText,
  getSubstances,
  numberDateRegex,
  parseDate,
  stringDateRegex,
} from '@topics/engine/rules/extraction-rules.js';
import type {
  IBox,
  IExtractedData,
  IExtractedDate,
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
} from '@topics/engine/fixtures/fds-tree.mother.js';
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
  H_HAZARD,
  EUH_HAZARD,
  P_HAZARD,
  MULTIPLE_P_HAZARD,
  CAS_NUMBER,
  CE_NUMBER,
  PRODUCER_IDENTIFIER,
  CAS_NUMBER_TEXT,
  CE_NUMBER_TEXT,
  H_HAZARD_WITH_DETAILS,
  MULTIPLE_P_HAZARD_WITH_DETAILS,
  PHYSICAL_STATE_VALUE,
} from '@topics/engine/fixtures/fixtures.constants.js';
import {
  aLine,
  aLineWithCASAndCENumberIn2Texts,
  aLineWithCASNumber,
  aLineWithCENumber,
  aLineWithEUHHazard,
  aLineWithHHazard,
  aLineWithMultiplePHazard,
  aLineWithOneText,
  aLineWithProducerIdentifierOnly,
  aLineWithProducerEndingWithDotIn1Text,
  aLineWithProducerIn1Text,
  aLineWithProducerIn2Texts,
  aLineWithProducerNameOnly,
  aLineWithProducerWithDotIn1Text,
  aLineWithProductIdentifierOnly,
  aLineWithProductIn1Text,
  aLineWithProductIn2Texts,
  aLineWithProductNameOnly,
  aLineWithTwoHazards,
} from '@topics/engine/fixtures/line.mother.js';
import { aSection } from '@topics/engine/fixtures/section.mother.js';
import { aSubSection, aSubSectionWith3LinesContainingProductName } from '@topics/engine/fixtures/sub-section.mother.js';
import { aTextWithRandomContent1, aTextWithRandomContent2, aTextWithRandomContent3 } from '@topics/engine/fixtures/text.mother.js';

describe('ExtractionRules tests', () => {
  const iBox: IBox = { xPositionProportion: POSITION_PROPORTION_X, yPositionProportion: POSITION_PROPORTION_Y };
  const metaData: IMetaData = { pageNumber: 1, startBox: iBox, endBox: undefined };

  describe('Regexps tests', () => {
    describe('NumberDateRegex tests', () => {
      it.each<[string, boolean]>([
        ['15-03-1995', true],
        ['14/06.2022', true],
        ['.14.06.2022.', true],
        ['28.04.15', true],
        ['date:01/02/2022page1/7version:n°', true],
        ['randomtext02.09.20221.partie1', true],
        // Invalid day cases
        ['00/01/2000', false],
        ['1/01/2000', false],
        ['32/01/2000', false],
        ['121/01/2000', false],
        // Invalid month cases
        ['03-00-1985', false],
        ['02.1.1995', false],
        ['02.13.1995', false],
        // Invalid year cases
        ['01.10.1', false],
        // ['01.10.133', false],       // FIXME: correct this in order to fail in JS func => matches 01.10.13
        // ['28.04.1899', false],      // FIXME: correct this in order to fail in JS func => matches 28.04.18
        // ['28.04.2100', false],      // FIXME: correct this in order to fail in JS func => matches 28.04.21
        // Invalid followed by minutes
        // ['15-03-1995:50', false],   // FIXME: correct this in order to fail in JS func => matches 15-03-19
      ])('"%s" input should return %s', (dateString, expected) => {
        expect(new RegExp(numberDateRegex).test(dateString)).toEqual(expected);
      });
    });

    describe('StringDateRegex tests', () => {
      it.each<[string, boolean]>([
        ['1janvier2022', true],
        ['15novembre1959', true],
        ['15novembre2099', true],
        ['15-janv2021', true],
        ['15janv.2021', true],
        ['15janv..2021', true],
        // Invalid day cases
        ['0avril2022', false],
        ['32avril2022', false],
        ['123avril2022', false],
        ['avril2022', false],
        // Invalid month cases
        ['12.2022', false],
        // Invalid year cases
        ['15novembre12', false],
        ['1mars', false],
        ['2022', false],
        ['01jan133', false],
        ['28avril1899', false],
        ['28avril2100', false],
        // Invalid cases
        ['7date:97', false],
        ['11informationstoxicologiques11', false],
      ])('"%s" input should return %s', (dateString, expected) => {
        expect(new RegExp(stringDateRegex).test(dateString)).toEqual(expected);
      });
    });

    describe('EnglishNumberDateRegex tests', () => {
      it.each<[string, boolean]>([
        ['1995-03-15', true],
        ['2022/06.14', true],
        ['2022.06.14.', true],
        ['15.04.01', true],
        // Invalid day cases
        ['2000/01/00', false],
        ['2000/01/1', false],
        ['2000/01/32', false],
        // Invalid month cases
        ['1985-00-03', false],
        ['1995.1.02', false],
        ['1995.13.02', false],
        // Invalid year cases
        ['1.10.01', false],
        // ['133.10.01', false],  // FIXME: correct this in order to fail in JS func => matches 33.10.01
        // ['1899.04.28', false], // FIXME: correct this in order to fail in JS func => matches 99.04.28
        // ['2100.04.28', false], // FIXME: correct this in order to fail in JS func => 00.04.28
      ])('"%s" input should return %s', (dateString, expected) => {
        expect(new RegExp(englishNumberDateRegex).test(dateString)).toEqual(expected);
      });
    });

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

  describe('RevisionDate rules tests', () => {
    describe('GetDateByRevisionText tests', () => {
      it.each<[string, string | null]>([
        ['révision:2017-09-01', '2017-09-01'],
        ['2017-09-01', null],
        ['révision:n°11(01/02/2022)safety-kleen', null],
      ])('"%s" input should return %s', (text, expected) => {
        expect(getDateByRevisionText(text)).toEqual(expected);
      });
    });

    describe('GetDateByMostFrequent tests', () => {
      it.each<[string, string | undefined | null]>([
        ['textnotmatchinganyregex', undefined],
        ['onlynumberregexmatch1occurence01/02/2022', null],
        ['onlynumberregexmatch2occ01/02/2022and01/02/2022', null],
        ['onlynumberregexmatch3occ01/02/2022and01/02/2022and01/02/2022', '01/02/2022'],
        ['regexmatch3occeachtakebiggest01/02/2022and01/02/2022and01/02/2022or18janv2040and18janv2040and18janv2040', '18janv2040'],
      ])('"%s" input should return %s', (text, expected) => {
        expect(getDateByMostFrequent(text)).toEqual(expected);
      });
    });

    describe('GetDateByMostRecent tests', () => {
      it.each<[string, string | undefined]>([
        ['abc01/02/2022def8janvier2023ghj', '8janvier2023'],
        ['randomtextbefore11.08.25andthisdate06mars1920', '11.08.25'],
        ['sometextnotmatchinganyregex', undefined],
      ])('"%s" input should return %s', (text, expected) => {
        expect(getDateByMostRecent(text)).toEqual(expected);
      });
    });

    describe('ParseDate tests', () => {
      it.each<[string, Date | null]>([
        // enters parseDateFromNumberRegex function
        ['placeholder09-01-2017sometext', new Date('2017/01/09')],
        ['14/08/98', new Date('1998/08/14')],
        ['14/08/38', new Date('2038/08/14')],
        // enters parseDateFromStringRegex function
        ['abc15janv2021def', new Date('2021/01/15')],
        ['abc15aout.2021def', new Date('2021/08/15')],
        // enters parseDateFromEnglishNumberRegex function
        ['abc2012/12/01', new Date('2012/12/01')],
        // invalid cases
        ['nodatematchinganyfunction', null],
        ['missingmappingmonth20xyz2023', new Date(NaN)],
      ])('"%s" input should return %s', (text, expected) => {
        expect(parseDate(text)).toEqual(expected);
      });
    });

    describe('GetDate tests', () => {
      it.each<[string, IExtractedDate]>([
        // enters getDateByRevisionText
        ['révision 15 août 2023', { formattedDate: '2023/08/15', inTextDate: '15aout2023' }],
        // enters getDateByMostFrequent
        ['abbcdef15aout2023et20/01/2000et20/01/2000et20/01/2000', { formattedDate: '2000/01/20', inTextDate: '20/01/2000' }],
        // enters getDateByMostRecent
        ['abbcdef15aout2023et20/01/2000et20/01/2000', { formattedDate: '2023/08/15', inTextDate: '15aout2023' }],
        // invalid cases
        ['', { formattedDate: null, inTextDate: null }],
        ['missingmappingmonth20xyz2023', { formattedDate: null, inTextDate: '20xyz2023' }],
        ['thereisnotasingledateinthere', { formattedDate: null, inTextDate: null }],
      ])('"%s" input should return %s', (text: string, expected) => {
        expect(getDate(text)).toEqual(expected);
      });
    });
  });

  describe('Product Name rules tests', () => {
    describe('GetProductByText tests', () => {
      it.each<[{ message: string; fdsTree: IFDSTree; expected: IExtractedProduct | null }]>([
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
        [{ message: 'it should return null when providing an empty fdsTree', fdsTree: anEmptyFdsTreeWithAllSections().properties, expected: null }],
        [
          {
            message: 'it should return null when providing a fdsTree with only product name identifier',
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
            message: 'it should return product name when providing a line with product in 1 text',
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
            message: 'it should return product name when providing a line with product in 2 texts',
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
            message: 'it should return product name when providing product in 2 lines',
            fdsTree: aFdsTree().withSection1(
              aSection().withSubsections({
                3: aSubSection().withLines([aLineWithProducerIdentifierOnly().properties, aLineWithProducerNameOnly().properties]).properties,
              }).properties,
            ).properties,
            expected: { name: PRODUCER_NAME, metaData },
          },
        ],
        // entering cleanProducer
        [
          {
            message: 'it should return product name when providing product ending with dot',
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
            message: 'it should return product name when providing product ending with dot',
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

  describe('Hazards rules tests', () => {
    describe('GetHazards tests', () => {
      it.each<[{ message: string; fdsTree: IFDSTree; expected: IExtractedDanger[] }]>([
        [{ message: 'it should return null when providing an empty fdsTree', fdsTree: anEmptyFdsTreeWithAllSections().properties, expected: [] }],
        [
          {
            message: 'it should retrieve hazards contained in lines',
            fdsTree: aFdsTree().withSection2(
              aSection().withSubsections({
                2: aSubSection().withLines([aLineWithHHazard().properties, aLineWithEUHHazard().properties]).properties,
              }).properties,
            ).properties,
            expected: [H_HAZARD, EUH_HAZARD],
          },
        ],
        [
          {
            message: 'it should retrieve hazards contained in texts and lines',
            fdsTree: aFdsTree().withSection2(
              aSection().withSubsections({
                2: aSubSection().withLines([aLineWithTwoHazards().properties, aLineWithMultiplePHazard().properties]).properties,
              }).properties,
            ).properties,
            expected: [H_HAZARD, P_HAZARD, MULTIPLE_P_HAZARD],
          },
        ],
      ])('$message', ({ fdsTree, expected }) => {
        expect(getHazards(fdsTree)).toEqual(expected);
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
      ${PRODUCER_IDENTIFIER}
      ${PRODUCER_NAME}
      ${H_HAZARD_WITH_DETAILS}
      ${MULTIPLE_P_HAZARD_WITH_DETAILS}
      ${MULTIPLE_P_HAZARD}
      ${CAS_NUMBER_TEXT}
      ${CE_NUMBER_TEXT}
    `;

      const expected: IExtractedData = {
        date: { formattedDate: '2015/05/18', inTextDate: '18/05/2015' },
        product: { name: PRODUCT_NAME, metaData },
        producer: { name: PRODUCER_NAME, metaData },
        hazards: [H_HAZARD, P_HAZARD, MULTIPLE_P_HAZARD],
        substances: [{ casNumber: CAS_NUMBER, ceNumber: CE_NUMBER }],
        physicalState: { value: PHYSICAL_STATE_VALUE, metaData },
      };

      await expect(applyExtractionRules({ fdsTreeCleaned: aFdsTreeWithAllSectionsWithUsefulInfo().properties, fullText })).resolves.toEqual(expected);
    });
  });
});
