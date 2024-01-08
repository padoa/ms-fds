import { describe, expect, it } from 'vitest';
import _ from 'lodash';
import type { IExtractedSubstance } from '@padoa/chemical-risk';

import { aLineWithCasAndCeNumberIn2Texts, aLineWithCeNumber, aLineWithCasNumber, aLine } from '@topics/engine/__fixtures__/line.mother.js';
import type { ILine } from '@topics/engine/model/fds.model.js';
import { aText } from '@topics/engine/__fixtures__/text.mother.js';
import { CasAndCeRulesService } from '@topics/engine/rules/extraction-rules/substance/cas-and-ce-rules.service.js';
import {
  aSubstanceWithCasAndCeNumber,
  aSubstanceWithOnlyACasNumber,
  aSubstanceWithOnlyACeNumber,
} from '@topics/engine/rules/extraction-rules/__tests__/__fixtures__/substance.mother.js';
import { aCasNumber } from '@topics/engine/rules/extraction-rules/__tests__/__fixtures__/cas-number.mother.js';

describe('CasAndCeRulesService tests', () => {
  describe('Regexps tests', () => {
    describe('CASNumberRegex tests', () => {
      it.each<{ input: string; expected: string }>([
        { input: '1234567-12-3', expected: '1234567-12-3' },
        { input: '1234567- 12-3', expected: '1234567- 12-3' },
        { input: '1234567 -12-3', expected: '1234567 -12-3' },
        { input: '1234567-12 -3', expected: '1234567-12 -3' },
        { input: '1234567-12- 3', expected: '1234567-12- 3' },
        { input: '1234567 - 12 - 3', expected: '1234567 - 12 - 3' },
        { input: '0 1234567 - 12 - 3', expected: '1234567 - 12 - 3' },
        { input: '1234567-12-3 4', expected: '1234567-12-3' },
        { input: '9876543-45-6', expected: '9876543-45-6' },
        { input: '111-22-3', expected: '111-22-3' },
        { input: '987-65-4', expected: '987-65-4' },
        { input: '1-23-4', expected: '1-23-4' },
        { input: '- 1234567-12-3', expected: '1234567-12-3' },
        { input: '-1234567-12-3', expected: undefined },
        { input: '1234567-12-3 -', expected: '1234567-12-3' },
        { input: '1234567-12-3-', expected: undefined },
        { input: '12-34567-12-3', expected: undefined },
        { input: '1234567-123-3', expected: undefined },
        { input: '1234567-12-3-4', expected: undefined },
        { input: 'abc-12-34', expected: undefined },
        { input: '12-34-def', expected: undefined },
        { input: '12-34-56789', expected: undefined },
        { input: '12-34', expected: undefined },
        { input: '12-34-', expected: undefined },
      ])('$input payload should return $expected', ({ input, expected }) => {
        expect(_.first(input.match(new RegExp(CasAndCeRulesService.CAS_NUMBER_REGEX)))).toEqual(expected);
      });
    });

    describe('CENumberRegex tests', () => {
      it.each<{ input: string; expected: string }>([
        { input: '123-456-7', expected: '123-456-7' },
        { input: '123 -456-7', expected: '123 -456-7' },
        { input: '123- 456-7', expected: '123- 456-7' },
        { input: '123-456 -7', expected: '123-456 -7' },
        { input: '123-456- 7', expected: '123-456- 7' },
        { input: '123 - 456 - 7', expected: '123 - 456 - 7' },
        { input: '0 123-456-7', expected: '123-456-7' },
        { input: '123-456-7 8', expected: '123-456-7' },
        { input: '987-654-3', expected: '987-654-3' },
        { input: '111-222-3', expected: '111-222-3' },
        { input: '987-654-3', expected: '987-654-3' },
        { input: '1-234-5', expected: undefined },
        { input: '1-23-456-7', expected: undefined },
        { input: '123-456-78', expected: undefined },
        { input: '-123-456-78', expected: undefined },
        { input: '- 123-456-78', expected: undefined },
        { input: '/123-456-78', expected: undefined },
        { input: '/ 123-456-78', expected: undefined },
        { input: '•123-456-78', expected: undefined },
        { input: '• 123-456-78', expected: undefined },
        { input: '123-456-78-', expected: undefined },
        { input: '123-456-78 -', expected: undefined },
        { input: '123-456-78/', expected: undefined },
        { input: '123-456-78 /', expected: undefined },
        { input: '123-456-78•', expected: undefined },
        { input: '123-456-78 •', expected: undefined },
        { input: 'abc-123-456', expected: undefined },
        { input: '123-abc-456', expected: undefined },
        { input: '123-456-', expected: undefined },
      ])('$input payload should return $expected', ({ input, expected }) => {
        expect(_.first(input.match(new RegExp(CasAndCeRulesService.CE_NUMBER_REGEX)))).toEqual(expected);
      });
    });
  });

  describe('getSubstancesCasAndCe tests', () => {
    it.each<{ message: string; lines: ILine[]; expected: IExtractedSubstance[] }>([
      {
        message: 'it should return an empty list when given an empty lines',
        lines: [],
        expected: [],
      },
      {
        message: 'it should return an empty list when given a text without cas nor ce number',
        lines: [aLine().build()],
        expected: [],
      },
      {
        message: 'it should return cas and ce number when it is contained in 2 texts',
        lines: [aLineWithCasAndCeNumberIn2Texts().build()],
        expected: [aSubstanceWithCasAndCeNumber().build()],
      },
      {
        message: 'it should return ce number even when cas number is missing',
        lines: [aLineWithCeNumber().build()],
        expected: [aSubstanceWithOnlyACeNumber().build()],
      },
      {
        message: 'it should return ce number even when it is contained in 2 lines',
        lines: [aLineWithCasNumber().build(), aLineWithCeNumber().build()],
        expected: [aSubstanceWithCasAndCeNumber().build()],
      },
      {
        message: 'it should return cas number even when it is contained in 2 lines',
        lines: [aLineWithCeNumber().build(), aLineWithCasNumber().build()],
        expected: [aSubstanceWithCasAndCeNumber().build()],
      },
      {
        message: 'it should not merge cas number and ce number if there are not on consecutive lines',
        lines: [aLineWithCeNumber().build(), aLine().build(), aLineWithCasNumber().build()],
        expected: [aSubstanceWithOnlyACeNumber().build(), aSubstanceWithOnlyACasNumber().build()],
      },
      {
        message: 'it should not merge cas number and a line with both cas and ce number',
        lines: [aLineWithCasAndCeNumberIn2Texts().build(), aLineWithCasNumber().build()],
        expected: [aSubstanceWithCasAndCeNumber().build(), aSubstanceWithOnlyACasNumber().build()],
      },
      {
        message: 'it should return deduplicated substances',
        lines: [aLineWithCasNumber().build(), aLineWithCasNumber().build()],
        expected: [aSubstanceWithOnlyACasNumber().build()],
      },
      {
        message: 'it should return substances without spaces',
        lines: [
          aLine()
            .withTexts([aText().withContent(' 123546 - 78 - 9 ')])
            .build(),
        ],
        expected: [aSubstanceWithOnlyACasNumber().withCasNumber(aCasNumber().withValue('123546-78-9').build()).build()],
      },
    ])('$message', ({ lines, expected }) => {
      expect(CasAndCeRulesService.getSubstancesCasAndCe(lines)).toEqual(expected);
    });
  });
});
