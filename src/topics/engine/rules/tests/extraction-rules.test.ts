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
  IExtractedHazard,
  IExtractedProducer,
  IExtractedProduct,
  IExtractedSubstance,
  IFDSTree,
  ILine,
  IMetaData,
} from '@topics/engine/model/fds.model.js';

describe('ExtractionRules tests', () => {
  const iBox: IBox = { xPositionInPercent: 1, yPositionInPercent: 1 };
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
      it.each<[ILine[], IExtractedProduct | null]>([
        [undefined, null],
        [
          [
            {
              texts: [],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          null,
        ],
        [
          [
            {
              texts: [
                { content: 'abc', ...iBox },
                { content: 'def', ...iBox },
              ],
              startBox: iBox,
              pageNumber: 1,
            },
            { texts: [{ content: 'ghi', ...iBox }], startBox: iBox, pageNumber: 1 },
          ],
          null,
        ],
        [
          [
            {
              texts: [{ content: 'quelque chose: nom du produit', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
            {
              texts: [{ content: ' désinfectant 2.0  ', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          { name: 'désinfectant 2.0', metaData },
        ],
        [
          [
            {
              texts: [
                { content: ' nom du produit ', ...iBox },
                { content: ':', ...iBox },
                { content: ' désinfectant 2.0', ...iBox },
              ],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          { name: 'désinfectant 2.0', metaData },
        ],
        [
          [
            {
              texts: [
                { content: 'texte random', ...iBox },
                { content: 'nom du produit : désinfectant 2.0', ...iBox },
              ],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          { name: 'désinfectant 2.0', metaData },
        ],
      ])('"%s" input should return %s', (lines, expected) => {
        const fdsTtree: IFDSTree = { 1: { subsections: { 1: { lines, ...iBox } }, ...iBox } };
        expect(getProductByText(fdsTtree)).toEqual(expected);
      });
    });

    describe('GetProductByLineOrder tests', () => {
      it.each<[ILine[], string, IExtractedProduct | null]>([
        [undefined, '', null],
        [
          [
            {
              texts: [],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          '',
          null,
        ],
        [
          [
            {
              texts: [
                { content: 'abc', ...iBox },
                { content: 'def', ...iBox },
              ],
              startBox: iBox,
              pageNumber: 1,
            },
            { texts: [{ content: 'ghi', ...iBox }], startBox: iBox, pageNumber: 1 },
          ],
          '',
          null,
        ],
        [
          [
            {
              texts: [{ content: "nom du produit: pas assez d'occurences", ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          "blabla... nom du produit: pas assez d'occurences blablabla... et pas assez d'occurences",
          null,
        ],
        [
          [
            {
              texts: [{ content: 'nom du produit: huile de coude', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          'nom du produit : huile de coude et puis il y a du texte et huile de coude et huile de coude encore plus loin',
          { name: 'huile de coude', metaData },
        ],
        [
          [
            {
              texts: [{ content: 'quelque chose: nom du produit', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
            {
              texts: [{ content: ' huile de coude  ', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          "quelque chose: nom du produit huile de coude puis encore huile de coude dans le cas où il y a de l'huile de coude",
          { name: 'huile de coude', metaData },
        ],
      ])('"%s" input should return %s', (lines, fullText, expected) => {
        const fdsTtree: IFDSTree = { 1: { subsections: { 1: { lines, ...iBox } }, ...iBox } };
        expect(getProductByLineOrder(fdsTtree, { fullText })).toEqual(expected);
      });
    });

    describe('GetProduct tests', () => {
      it.each<[ILine[], string, IExtractedProduct | null]>([
        [[], '', null],
        // enters getProductByText
        [
          [
            {
              texts: [{ content: 'quelque chose: nom du produit', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
            {
              texts: [{ content: ' désinfectant 2.0  ', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          'quelque chose: nom du produit désinfectant 2.0  ',
          { name: 'désinfectant 2.0', metaData },
        ],
        // enters getProductByLineOrder
        [
          [
            {
              texts: [{ content: 'quelque chose: pas de nom de produit !', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
            {
              texts: [{ content: ' désinfectant 2.0  ', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          'quelque chose: nom du produit désinfectant 2.0  et désinfectant 2.0 et désinfectant 2.0',
          { name: 'désinfectant 2.0', metaData },
        ],
      ])('"%s" input should return %s', (lines, fullText, expected) => {
        const fdsTtree: IFDSTree = { 1: { subsections: { 1: { lines, ...iBox } }, ...iBox } };
        expect(getProduct(fdsTtree, { fullText })).toEqual(expected);
      });
    });
  });

  describe('Producer rules tests', () => {
    describe('GetProducer tests', () => {
      it.each<[ILine[], IExtractedProducer | null]>([
        [undefined, null],
        [
          [
            {
              texts: [],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          null,
        ],
        [
          [
            {
              texts: [{ content: 'blablabla : 1.3 fournisseur ', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          null,
        ],
        [
          [
            {
              texts: [{ content: '1.3  fournisseur  : @Padoa - FDS SaaS ', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          { name: '@Padoa - FDS SaaS', metaData },
        ],
        [
          [
            {
              texts: [
                { content: '1.3  fournisseur : ', ...iBox },
                { content: ' @Padoa - FDS SaaS  ', ...iBox },
              ],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          { name: '@Padoa - FDS SaaS', metaData },
        ],
        [
          [
            {
              texts: [{ content: '1.3  fournisseur : ', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
            {
              texts: [{ content: ' @Padoa - FDS SaaS  ', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          { name: '@Padoa - FDS SaaS', metaData },
        ],
        // entering cleanProducer
        [
          [
            {
              texts: [{ content: '1.3  fournisseur  : @Padoa - FDS SaaS. ', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          { name: '@Padoa - FDS SaaS', metaData },
        ],
        [
          [
            {
              texts: [{ content: '1.3  fournisseur  : E.T ', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          { name: 'E.T', metaData },
        ],
      ])('"%s" input should return %s', (lines, expected) => {
        const fdsTtree: IFDSTree = { 1: { subsections: { 3: { lines, ...iBox } }, ...iBox } };
        expect(getProducer(fdsTtree)).toEqual(expected);
      });
    });
  });

  describe('Hazards rules tests', () => {
    describe('GetHazards tests', () => {
      it.each<[ILine[], IExtractedHazard[]]>([
        [undefined, []],
        [
          [
            {
              texts: [],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          [],
        ],
        [
          [
            {
              texts: [{ content: ' h350i ', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
            {
              texts: [{ content: 'et puis aussi euh212 mais pas euh132 mais euh401 si', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          ['h350i', 'euh212', 'euh401'],
        ],
        [
          [
            {
              texts: [
                { content: 'mentions de danger : h 304 : blabla', ...iBox },
                { content: 'et puis aussi une phrase P qui est p331', ...iBox },
              ],
              startBox: iBox,
              pageNumber: 1,
            },
            {
              texts: [{ content: 'associé à une autre phrase P complexe p301+ p 310', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          ['h304', 'p331', 'p301 + p310'],
        ],
      ])('"%s" input should return %s', (lines, expected) => {
        const fdsTtree: IFDSTree = { 2: { subsections: { 2: { lines, ...iBox } }, ...iBox } };
        expect(getHazards(fdsTtree)).toEqual(expected);
      });
    });
  });

  describe('Substances rules tests', () => {
    describe('GetSubstances tests', () => {
      it.each<[ILine[], ILine[], IExtractedSubstance[]]>([
        [undefined, undefined, []],
        [
          [
            {
              texts: [],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          [
            {
              texts: [],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          [],
        ],
        [
          [
            {
              texts: [
                { content: 'huiles minérales ', ...iBox },
                { content: 'cas : 64742-52-5 ', ...iBox },
                { content: 'de base ce : 265-155-0 ', ...iBox },
              ],
              startBox: iBox,
              pageNumber: 1,
            },
            {
              texts: [
                { content: 'cas : 67762-38-3 ', ...iBox },
                { content: "esters d'acide gras ce : 267-015-4 ", ...iBox },
              ],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          [],
          [
            { casNumber: '64742-52-5', ceNumber: '265-155-0' },
            { casNumber: '67762-38-3', ceNumber: '267-015-4' },
          ],
        ],
        [
          [
            {
              texts: [
                { content: ' cas : 64742-52-5 ', ...iBox },
                { content: ' ce : 265-155-0 ', ...iBox },
              ],
              startBox: iBox,
              pageNumber: 1,
            },
            {
              texts: [{ content: ' ce : 265-155-0 ', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          [],
          [
            { casNumber: '64742-52-5', ceNumber: '265-155-0' },
            { casNumber: undefined, ceNumber: '265-155-0' },
          ],
        ],
        [
          [
            {
              texts: [{ content: 'cas : 64742-52-5 ', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
            {
              texts: [{ content: 'ce 265-155-0', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
            {
              texts: [{ content: 'ce : 221-838-5 ', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
            {
              texts: [{ content: 'cas 55965-84-9', ...iBox }],
              startBox: iBox,
              pageNumber: 1,
            },
          ],
          [],
          [
            { casNumber: '64742-52-5', ceNumber: '265-155-0' },
            { casNumber: '55965-84-9', ceNumber: '221-838-5' },
          ],
        ],
      ])('"%s" input should return %s', (subSection1Lines, SubSection2Lines, expected) => {
        const fdsTtree: IFDSTree = {
          3: { subsections: { 1: { lines: subSection1Lines, ...iBox }, 2: { lines: SubSection2Lines, ...iBox } }, ...iBox },
        };
        expect(getSubstances(fdsTtree)).toEqual(expected);
      });
    });
  });

  describe('ApplyExtractionRules tests', () => {
    it('Should extract all fields from fds', async () => {
      const fullTextLines = [
        'révision : 18/05/2015',
        'nom du produit: ps 2175',
        '1.3.',
        'societe industrielle de diffusion',
        'h317 - peut provoquer une allergie cutanée',
        'p261 - éviter de respirer les poussières/fumées/gaz/brouillards/vapeurs/aérosols',
        'p303+p361+p353 - en cas de contact avec la peau (ou les cheveux): enlever ',
        'numéro ce ',
        '233-826-7',
        'numéro cas 3251-23-8',
      ];
      const [, productName, section1point3, producerName, h317text, p261Text, pAdditionedText, ceNumberTitle, ceNumberText, numeroCasText] =
        fullTextLines;

      const fdsTree: IFDSTree = {
        '1': {
          xPositionInPercent: 2,
          yPositionInPercent: 5.873,
          subsections: {
            '1': {
              xPositionInPercent: 2,
              yPositionInPercent: 6.666,
              lines: [
                {
                  startBox: { xPositionInPercent: 1, yPositionInPercent: 1 },
                  pageNumber: 1,
                  texts: [
                    {
                      xPositionInPercent: 1.988,
                      yPositionInPercent: 8.145,
                      content: productName,
                    },
                  ],
                },
              ],
            },
            '3': {
              xPositionInPercent: 2,
              yPositionInPercent: 28.54,
              lines: [
                {
                  startBox: { xPositionInPercent: 2, yPositionInPercent: 28.54 },
                  pageNumber: 1,
                  texts: [
                    {
                      xPositionInPercent: 2,
                      yPositionInPercent: 28.54,
                      content: section1point3,
                    },
                  ],
                },
                {
                  startBox: { xPositionInPercent: 1, yPositionInPercent: 1 },
                  pageNumber: 1,
                  texts: [
                    {
                      xPositionInPercent: 2,
                      yPositionInPercent: 29.28,
                      content: producerName,
                    },
                  ],
                },
              ],
            },
          },
        },
        '2': {
          xPositionInPercent: 2,
          yPositionInPercent: 34.598,
          subsections: {
            '2': {
              xPositionInPercent: 2,
              yPositionInPercent: 107.628,
              lines: [
                {
                  startBox: { xPositionInPercent: 13.575, yPositionInPercent: 115.139 },
                  pageNumber: 1,
                  texts: [
                    {
                      xPositionInPercent: 13.575,
                      yPositionInPercent: 115.139,
                      content: h317text,
                    },
                    {
                      xPositionInPercent: 13.575,
                      yPositionInPercent: 116.994,
                      content: p261Text,
                    },
                    {
                      xPositionInPercent: 13.575,
                      yPositionInPercent: 118.667,
                      content: pAdditionedText,
                    },
                  ],
                },
              ],
            },
          },
        },
        '3': {
          xPositionInPercent: 2,
          yPositionInPercent: 129.159,
          subsections: {
            '2': {
              xPositionInPercent: 2,
              yPositionInPercent: 131.934,
              lines: [
                {
                  startBox: { xPositionInPercent: 11.197, yPositionInPercent: 140.415 },
                  pageNumber: 1,
                  texts: [
                    {
                      xPositionInPercent: 12.76,
                      yPositionInPercent: 140.415,
                      content: ceNumberTitle,
                    },
                    {
                      xPositionInPercent: 13.544,
                      yPositionInPercent: 140.415,
                      content: ceNumberText,
                    },
                    {
                      xPositionInPercent: 13.795,
                      yPositionInPercent: 142.031,
                      content: numeroCasText,
                    },
                  ],
                },
              ],
            },
          },
        },
      };

      const expected: IExtractedData = {
        date: { formattedDate: '2015/05/18', inTextDate: '18/05/2015' },
        product: { name: 'ps 2175', metaData },
        producer: { name: 'societe industrielle de diffusion', metaData },
        hazards: ['h317', 'p261', 'p303 + p361 + p353'],
        substances: [{ casNumber: '3251-23-8', ceNumber: '233-826-7' }],
      };

      await expect(applyExtractionRules({ fdsTreeCleaned: fdsTree, fullText: fullTextLines.join('') })).resolves.toEqual(expected);
    });
  });
});
