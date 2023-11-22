import { describe, expect, it } from 'vitest';

import {
  englishNumberDateRegex,
  getDateByMostFrequent,
  getDateByMostRecent,
  getDateByRevisionText,
  numberDateRegex,
  stringDateRegex,
} from '@topics/engine/rules/extraction-rules.js';

describe('ExtractionRules tests', () => {
  describe('Regexps tests', () => {
    describe('NumberDateRegex tests', () => {
      it.each([
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
        // ['01.10.133', false], // FIXME: correct this in order to fail in JS func => matches 01.10.13
        // ['28.04.1899', false], // FIXME: correct this in order to fail in JS func => matches 28.04.18
        // ['28.04.2100', false], // FIXME: correct this in order to fail in JS func => matches 28.04.21
        // Invalid followed by minutes
        // ['15-03-1995:50', false], // FIXME: correct this in order to fail in JS func => matches 15-03-19
      ])('"%s" input should return %s', (dateString: string, expected: boolean) => {
        expect(new RegExp(numberDateRegex).test(dateString)).toEqual(expected);
      });
    });

    describe('StringDateRegex tests', () => {
      it.each([
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
      ])('"%s" input should return %s', (dateString: string, expected: boolean) => {
        expect(new RegExp(stringDateRegex).test(dateString)).toEqual(expected);
      });
    });

    describe('EnglishNumberDateRegex tests', () => {
      it.each([
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
        // ['133.10.01', false], // FIXME: correct this in order to fail in JS func => matches 33.10.01
        // ['1899.04.28', false], // FIXME: correct this in order to fail in JS func => matches 99.04.28
        // ['2100.04.28', false], // FIXME: correct this in order to fail in JS func => 00.04.28
      ])('"%s" input should return %s', (dateString: string, expected: boolean) => {
        expect(new RegExp(englishNumberDateRegex).test(dateString)).toEqual(expected);
      });
    });
  });

  describe('RevisionDate rules tests', () => {
    describe('GetDateByRevisionText tests', () => {
      it.each([
        ['révision:2017-09-01', true],
        ['2017-09-01', false],
        ['révision:n°11(01/02/2022)safety-kleen', false],
      ])('"%s" input should return %s', (text: string, expected: boolean) => {
        expect(!!getDateByRevisionText(text)).toEqual(expected);
      });
    });

    describe('GetDateByMostFrequent tests', () => {
      it.each([
        ['textnotmatchinganyregex', undefined],
        ['onlynumberregexmatch1occurence01/02/2022', null],
        ['onlynumberregexmatch2occ01/02/2022and01/02/2022', null],
        ['onlynumberregexmatch3occ01/02/2022and01/02/2022and01/02/2022', '01/02/2022'],
        ['regexmatch3occeachtakebiggest01/02/2022and01/02/2022and01/02/2022or18janv2040and18janv2040and18janv2040', '18janv2040'],
      ])('"%s" input should return %s', (text: string, expected: string | null | undefined) => {
        expect(getDateByMostFrequent(text)).toEqual(expected);
      });
    });

    describe('GetDateByMostRecent tests', () => {
      it.each([
        ['abc01/02/2022def8janvier2023ghj', '8janvier2023'],
        ['randomtextbefore11.08.25andthisdate06mars1920', '11.08.25'],
        ['sometextnotmatchinganyregex', undefined],
      ])('"%s" input should return %s', (text: string, expected: string | undefined) => {
        expect(getDateByMostRecent(text)).toEqual(expected);
      });
    });
  });

  describe('Product Name rules tests', () => {
    describe('GetProductNameByText tests', () => {
      // FIXME: add tests
      it('should...', () => {});
    });

    describe('GetProductNameByLineOrder tests', () => {
      // FIXME: add tests
      it('should...', () => {});
    });
  });

  describe('Producer rules tests', () => {
    describe('GetProducer tests', () => {
      // FIXME: add tests
      it('should...', () => {});
    });
  });

  describe('Hazards rules tests', () => {
    describe('getHazards tests', () => {
      // FIXME: add tests
      it('should...', () => {});
    });
  });

  describe('Substances rules tests', () => {
    describe('getHazards tests', () => {
      // FIXME: add tests
      it('should...', () => {});
    });
  });
});
