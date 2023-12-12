import { describe, expect, it } from 'vitest';

import type { IExtractedDate } from '@topics/engine/model/fds.model.js';
import { RevisionDateRulesService } from '@topics/engine/rules/extraction-rules/revision-date-rules.service.js';

describe('RevisionDateRulesService tests', () => {
  describe('Regexps tests', () => {
    describe('NUMBER_DATE_REGEX', () => {
      it.each<[string, boolean]>([
        ['15-03-1995', true],
        ['14 / 06 / 2022', true],
        ['15 - 03 - 1995', true],
        ['14/06.2022', true],
        ['.14.06.2022.', true],
        ['28.04.15', true],
        ['date: 01/02/2022 page 1/7 version: n°', true],
        ['random text 02.09.20221. partie1', true],
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
        expect(new RegExp(RevisionDateRulesService.NUMBER_DATE_REGEX).test(dateString)).toEqual(expected);
      });
    });

    describe('STRING_DATE_REGEX', () => {
      it.each<[string, boolean]>([
        ['1 janvier 2022', true],
        ['1 décembre 2022', true],
        ['15novembre 1959', true],
        ['15 novembre1959', true],
        ['15novembre1959', true],
        ['15novembre2099', true],
        ['15-janv2021', true],
        ['15janv.2021', true],
        ['15janv..2021', true],
        // Invalid day cases
        ['0 avril 2022', false],
        ['0avril2022', false],
        ['32avril2022', false],
        ['123avril2022', false],
        ['avril2022', false],
        // Invalid month cases
        ['12.2022', false],
        // Invalid year cases
        ['15 novembre 12', false],
        ['15novembre 12', false],
        ['15novembre12', false],
        ['1mars', false],
        ['2022', false],
        ['01jan133', false],
        ['28avril1899', false],
        ['28avril2100', false],
        // Invalid cases
        ['7date:97', false],
        ['11 informations toxicologiques 11', false],
      ])('"%s" input should return %s', (dateString, expected) => {
        expect(new RegExp(RevisionDateRulesService.STRING_DATE_REGEX).test(dateString)).toEqual(expected);
      });
    });

    describe('ENGLISH_NUMBER_DATE_REGEX', () => {
      it.each<[string, boolean]>([
        ['1995-03-15', true],
        ['1995 - 03 - 15', true],
        ['1995-03 - 15', true],
        ['1995 -03-15', true],
        ['2022/06.14', true],
        ['2022.06.14.', true],
        ['15.04.01', true],
        // Invalid day cases
        ['2000 / 01 / 00', false],
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
        expect(new RegExp(RevisionDateRulesService.ENGLISH_NUMBER_DATE_REGEX).test(dateString)).toEqual(expected);
      });
    });
  });

  describe('RevisionDate rules tests', () => {
    describe('GetDateByRevisionText tests', () => {
      it.each<[string, string | null]>([
        ['révision: 2017-09-01', '2017-09-01'],
        ['Revision:2017-09-01', '2017-09-01'],
        ['Revision : 2010-02-01', '2010-02-01'],
        ['Revision: 1 janvier 2022', '1 janvier 2022'],
        ['2017-09-01', null],
        ['révision: n°11 (01/02/2022) safety-kleen', null],
      ])('"%s" input should return %s', (text, expected) => {
        expect(RevisionDateRulesService.getDateByRevisionText(text)).toEqual(expected);
      });
    });

    describe('GetDateByMostFrequent tests', () => {
      it.each<[string, string | undefined | null]>([
        ['text not matching any regex', undefined],
        ['only number regex match 1 occurence 01/02/2022', null],
        ['only number regex match 2 occ 01/02/2022 and 01/02/2022', null],
        ['only number regex match 3 occ 01/02/2022 and 01/02/2022 and 01/02/2022', '01/02/2022'],
        ['regex match 3 occ each take biggest 01/02/2022 and 01/02/2022 and 01/02/2022 or 18janv2040 and 18janv2040 and 18janv2040', '18janv2040'],
      ])('"%s" input should return %s', (text, expected) => {
        expect(RevisionDateRulesService.getDateByMostFrequent(text)).toEqual(expected);
      });
    });

    describe('GetDateByMostRecent tests', () => {
      it.each<[string, string | undefined]>([
        ['abc 01/02/2022 def 8 janvier 2023 ghj', '8 janvier 2023'],
        ['random text before 11.08.25 and this date 06 mars 1920', '11.08.25'],
        ['some text not matching any regex', undefined],
      ])('"%s" input should return %s', (text, expected) => {
        expect(RevisionDateRulesService.getDateByMostRecent(text)).toEqual(expected);
      });
    });

    describe('ParseDate tests', () => {
      it.each<[string, Date | null]>([
        // enters parseDateFromNumberRegex function
        ['placeholder 09-01-2017 some text', new Date('2017/01/09')],
        ['14/08/98', new Date('1998/08/14')],
        ['14/08/38', new Date('2038/08/14')],
        // enters parseDateFromStringRegex function
        ['abc 15 janv 2021 def', new Date('2021/01/15')],
        ['abc 15 août. 2021 def', new Date('2021/08/15')],
        ['abc 20 décembre 1998 def', new Date('1998/12/20')],
        ['abc 19 février 2035 def', new Date('2035/02/19')],
        // enters parseDateFromEnglishNumberRegex function
        ['abc 2012/12/01', new Date('2012/12/01')],
        // invalid cases
        ['no date matching any function', null],
        ['missing mapping month 20 xyz 2023', new Date(NaN)],
      ])('"%s" input should return %s', (text, expected) => {
        expect(RevisionDateRulesService.parseDate(text)).toEqual(expected);
      });
    });

    describe('GetDate tests', () => {
      it.each<[string, IExtractedDate]>([
        // enters getDateByRevisionText
        ['révision 15 août 2023', { formattedDate: '2023/08/15', inTextDate: '15 août 2023' }],
        // enters getDateByMostFrequent
        ['abbcdef 15 aout 2023 et 20/01/2000 et 20/01/2000 et 20/01/2000', { formattedDate: '2000/01/20', inTextDate: '20/01/2000' }],
        // enters getDateByMostRecent
        ['abbcdef 15 août 2023 et 20/01/2000 et 20/01/2000', { formattedDate: '2023/08/15', inTextDate: '15 août 2023' }],
        // invalid cases
        ['', { formattedDate: null, inTextDate: null }],
        ['missing mapping month 20xyz2023', { formattedDate: null, inTextDate: '20xyz2023' }],
        ['thereisnotasingledateinthere', { formattedDate: null, inTextDate: null }],
      ])('"%s" input should return %s', (text: string, expected) => {
        expect(RevisionDateRulesService.getDate(text)).toEqual(expected);
      });
    });
  });
});
