import { describe, expect, it } from 'vitest';

import {
  applyExtractionRules,
  englishNumberDateRegex,
  getDate,
  getDateByMostFrequent,
  getDateByMostRecent,
  getDateByRevisionText,
  getHazards,
  getProducer,
  getProductName,
  getProductNameByLineOrder,
  getProductNameByText,
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
} from '@topics/engine/model/fds.model.js';
import { ps2175FdsTreeCleaned, ps2175FullText } from '@topics/engine/rules/tests/extraction-rules.test-setup.js';

describe('ExtractionRules tests', () => {
  const iBox: IBox = { x: 1.0, y: 1.0 };

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
    describe('GetProductNameByText tests', () => {
      it.each<[ILine[], IExtractedProduct | null]>([
        [undefined, null],
        [
          [
            {
              texts: [],
              ...iBox,
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
              ...iBox,
            },
            { texts: [{ content: 'ghi', ...iBox }], ...iBox },
          ],
          null,
        ],
        [
          [
            {
              texts: [{ content: 'quelque chose: nom du produit', ...iBox }],
              ...iBox,
            },
            {
              texts: [{ content: ' désinfectant 2.0  ', ...iBox }],
              ...iBox,
            },
          ],
          'désinfectant 2.0',
        ],
        [
          [
            {
              texts: [
                { content: ' nom du produit ', ...iBox },
                { content: ':', ...iBox },
                { content: ' désinfectant 2.0', ...iBox },
              ],
              ...iBox,
            },
          ],
          'désinfectant 2.0',
        ],
        [
          [
            {
              texts: [
                { content: 'texte random', ...iBox },
                { content: 'nom du produit : désinfectant 2.0', ...iBox },
              ],
              ...iBox,
            },
          ],
          'désinfectant 2.0',
        ],
      ])('"%s" input should return %s', (lines, expected) => {
        const fdsTtree: IFDSTree = { 1: { subsections: { 1: { lines, ...iBox } }, ...iBox } };
        expect(getProductNameByText(fdsTtree)).toEqual(expected);
      });
    });

    describe('GetProductNameByLineOrder tests', () => {
      it.each<[ILine[], string, IExtractedProduct | null]>([
        [undefined, '', null],
        [
          [
            {
              texts: [],
              ...iBox,
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
              ...iBox,
            },
            { texts: [{ content: 'ghi', ...iBox }], ...iBox },
          ],
          '',
          null,
        ],
        [
          [
            {
              texts: [{ content: "nom du produit: pas assez d'occurences", ...iBox }],
              ...iBox,
            },
          ],
          "blabla... nom du produit: pas assez d'occurences blablabla... et pas assez d'occurences",
          null,
        ],
        [
          [
            {
              texts: [{ content: 'nom du produit: huile de coude', ...iBox }],
              ...iBox,
            },
          ],
          'nom du produit : huile de coude et puis il y a du texte et huile de coude et huile de coude encore plus loin',
          'huile de coude',
        ],
        [
          [
            {
              texts: [{ content: 'quelque chose: nom du produit', ...iBox }],
              ...iBox,
            },
            {
              texts: [{ content: ' huile de coude  ', ...iBox }],
              ...iBox,
            },
          ],
          "quelque chose: nom du produit huile de coude puis encore huile de coude dans le cas où il y a de l'huile de coude",
          'huile de coude',
        ],
      ])('"%s" input should return %s', (lines, fullText, expected) => {
        const fdsTtree: IFDSTree = { 1: { subsections: { 1: { lines, ...iBox } }, ...iBox } };
        expect(getProductNameByLineOrder(fdsTtree, { fullText })).toEqual(expected);
      });
    });

    describe('GetProductName tests', () => {
      it.each<[ILine[], string, IExtractedProduct | null]>([
        [[], '', null],
        // enters getProductNameByText
        [
          [
            {
              texts: [{ content: 'quelque chose: nom du produit', ...iBox }],
              ...iBox,
            },
            {
              texts: [{ content: ' désinfectant 2.0  ', ...iBox }],
              ...iBox,
            },
          ],
          'quelque chose: nom du produit désinfectant 2.0  ',
          'désinfectant 2.0',
        ],
        // enters getProductNameByLineOrder
        [
          [
            {
              texts: [{ content: 'quelque chose: pas de nom de produit !', ...iBox }],
              ...iBox,
            },
            {
              texts: [{ content: ' désinfectant 2.0  ', ...iBox }],
              ...iBox,
            },
          ],
          'quelque chose: nom du produit désinfectant 2.0  et désinfectant 2.0 et désinfectant 2.0',
          'désinfectant 2.0',
        ],
      ])('"%s" input should return %s', (lines, fullText, expected) => {
        const fdsTtree: IFDSTree = { 1: { subsections: { 1: { lines, ...iBox } }, ...iBox } };
        expect(getProductName(fdsTtree, { fullText })).toEqual(expected);
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
              ...iBox,
            },
          ],
          null,
        ],
        [
          [
            {
              texts: [{ content: 'blablabla : 1.3 fournisseur ', ...iBox }],
              ...iBox,
            },
          ],
          null,
        ],
        [
          [
            {
              texts: [{ content: '1.3  fournisseur  : @Padoa - FDS SaaS ', ...iBox }],
              ...iBox,
            },
          ],
          '@Padoa - FDS SaaS',
        ],
        [
          [
            {
              texts: [
                { content: '1.3  fournisseur : ', ...iBox },
                { content: ' @Padoa - FDS SaaS  ', ...iBox },
              ],
              ...iBox,
            },
          ],
          '@Padoa - FDS SaaS',
        ],
        [
          [
            {
              texts: [{ content: '1.3  fournisseur : ', ...iBox }],
              ...iBox,
            },
            {
              texts: [{ content: ' @Padoa - FDS SaaS  ', ...iBox }],
              ...iBox,
            },
          ],
          '@Padoa - FDS SaaS',
        ],
        // entering cleanProducer
        [
          [
            {
              texts: [{ content: '1.3  fournisseur  : @Padoa - FDS SaaS. ', ...iBox }],
              ...iBox,
            },
          ],
          '@Padoa - FDS SaaS',
        ],
        [
          [
            {
              texts: [{ content: '1.3  fournisseur  : E.T ', ...iBox }],
              ...iBox,
            },
          ],
          'E.T',
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
              ...iBox,
            },
          ],
          [],
        ],
        [
          [
            {
              texts: [{ content: ' h350i ', ...iBox }],
              ...iBox,
            },
            {
              texts: [{ content: 'et puis aussi euh212 mais pas euh132 mais euh401 si', ...iBox }],
              ...iBox,
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
              ...iBox,
            },
            {
              texts: [{ content: 'associé à une autre phrase P complexe p301+ p 310', ...iBox }],
              ...iBox,
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
              ...iBox,
            },
          ],
          [
            {
              texts: [],
              ...iBox,
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
              ...iBox,
            },
            {
              texts: [
                { content: 'cas : 67762-38-3 ', ...iBox },
                { content: "esters d'acide gras ce : 267-015-4 ", ...iBox },
              ],
              ...iBox,
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
              ...iBox,
            },
            {
              texts: [{ content: ' ce : 265-155-0 ', ...iBox }],
              ...iBox,
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
              ...iBox,
            },
            {
              texts: [{ content: 'ce 265-155-0', ...iBox }],
              ...iBox,
            },
            {
              texts: [{ content: 'ce : 221-838-5 ', ...iBox }],
              ...iBox,
            },
            {
              texts: [{ content: 'cas 55965-84-9', ...iBox }],
              ...iBox,
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
    it('Should return', async () => {
      const expected: IExtractedData = {
        date: { formattedDate: '2015/05/18', inTextDate: '18/05/2015' },
        product: 'ps 2175',
        producer: 'societe industrielle de diffusion',
        hazards: ['h314', 'h317', 'h400', 'h411', 'p261', 'p280', 'p303 + p361 + p353', 'p304 + p340', 'p310', 'p305 + p351 + p338', 'p362 + p364'],
        substances: [
          { casNumber: undefined, ceNumber: '233-826-7' },
          { casNumber: undefined, ceNumber: '221-838-5' },
          { casNumber: '55965-84-9', ceNumber: undefined },
        ],
      };

      await expect(applyExtractionRules({ fdsTreeCleaned: ps2175FdsTreeCleaned, fullText: ps2175FullText })).resolves.toEqual(expected);
    });
  });
});
