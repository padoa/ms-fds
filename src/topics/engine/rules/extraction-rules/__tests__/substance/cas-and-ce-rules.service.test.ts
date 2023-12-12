import { describe, expect, it } from 'vitest';

import { CAS_NUMBER, CE_NUMBER } from '@topics/engine/__fixtures__/fixtures.constants.js';
import { aLineWithCASAndCENumberIn2Texts, aLineWithCENumber, aLineWithCASNumber, aLine } from '@topics/engine/__fixtures__/line.mother.js';
import type { IExtractedSubstance, ILine } from '@topics/engine/model/fds.model.js';
import { CasAndCeRulesService } from '@topics/engine/rules/extraction-rules/substance/cas-and-ce-rules.service.js';

describe('CasAndCeRulesService tests', () => {
  describe('Regexps tests', () => {
    describe('CASNumberRegex tests', () => {
      it.each<{ input: string; expected: boolean }>([
        { input: '1234567-12-3', expected: true },
        { input: '1234567- 12-3', expected: true },
        { input: '1234567 -12-3', expected: true },
        { input: '1234567-12 -3', expected: true },
        { input: '1234567-12- 3', expected: true },
        { input: '1234567 - 12 - 3', expected: true },
        { input: '0 1234567 - 12 - 3', expected: true },
        { input: '1234567-12-3 4', expected: true },
        { input: '9876543-45-6', expected: true },
        { input: '111-22-3', expected: true },
        { input: '987-65-4', expected: true },
        { input: '1-23-4', expected: true },
        { input: '-1234567-12-3', expected: false },
        { input: '- 1234567-12-3', expected: false },
        { input: '/1234567-12-3', expected: false },
        { input: '/ 1234567-12-3', expected: false },
        { input: '•1234567-12-3', expected: false },
        { input: '• 1234567-12-3', expected: false },
        { input: '1234567-12-3-', expected: false },
        { input: '1234567-12-3 -', expected: false },
        { input: '1234567-12-3/', expected: false },
        { input: '1234567-12-3 /', expected: false },
        { input: '1234567-12-3•', expected: false },
        { input: '1234567-12-3 •', expected: false },
        { input: '12-34567-12-3', expected: false },
        { input: '1234567-123-3', expected: false },
        { input: '1234567-12-3-4', expected: false },
        { input: 'abc-12-34', expected: false },
        { input: '12-34-def', expected: false },
        { input: '12-34-56789', expected: false },
        { input: '12-34', expected: false },
        { input: '12-34-', expected: false },
      ])('$input payload should return $expected', ({ input, expected }) => {
        expect(new RegExp(CasAndCeRulesService.CAS_NUMBER_REGEX).test(input)).toEqual(expected);
      });
    });

    describe('CENumberRegex tests', () => {
      it.each<{ input: string; expected: boolean }>([
        { input: '123-456-7', expected: true },
        { input: '123 -456-7', expected: true },
        { input: '123- 456-7', expected: true },
        { input: '123-456 -7', expected: true },
        { input: '123-456- 7', expected: true },
        { input: '123 - 456 - 7', expected: true },
        { input: '0 123-456-7', expected: true },
        { input: '123-456-7 8', expected: true },
        { input: '987-654-3', expected: true },
        { input: '111-222-3', expected: true },
        { input: '987-654-3', expected: true },
        { input: '1-234-5', expected: false },
        { input: '1-23-456-7', expected: false },
        { input: '123-456-78', expected: false },
        { input: '-123-456-78', expected: false },
        { input: '- 123-456-78', expected: false },
        { input: '/123-456-78', expected: false },
        { input: '/ 123-456-78', expected: false },
        { input: '•123-456-78', expected: false },
        { input: '• 123-456-78', expected: false },
        { input: '123-456-78-', expected: false },
        { input: '123-456-78 -', expected: false },
        { input: '123-456-78/', expected: false },
        { input: '123-456-78 /', expected: false },
        { input: '123-456-78•', expected: false },
        { input: '123-456-78 •', expected: false },
        { input: 'abc-123-456', expected: false },
        { input: '123-abc-456', expected: false },
        { input: '123-456-', expected: false },
      ])('$input payload should return $expected', ({ input, expected }) => {
        expect(new RegExp(CasAndCeRulesService.CE_NUMBER_REGEX).test(input)).toEqual(expected);
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
        lines: [aLine().properties],
        expected: [],
      },
      {
        message: 'it should return cas and ce number when it is contained in 2 texts',
        lines: [aLineWithCASAndCENumberIn2Texts().properties],
        expected: [{ casNumber: CAS_NUMBER, ceNumber: CE_NUMBER }],
      },
      {
        message: 'it should return ce number even when cas number is missing',
        lines: [aLineWithCENumber().properties],
        expected: [{ casNumber: undefined, ceNumber: CE_NUMBER }],
      },
      {
        message: 'it should return ce number even when it is contained in 2 lines',
        lines: [aLineWithCASNumber().properties, aLineWithCENumber().properties],
        expected: [{ casNumber: CAS_NUMBER, ceNumber: CE_NUMBER }],
      },
      {
        message: 'it should return cas number even when it is contained in 2 lines',
        lines: [aLineWithCENumber().properties, aLineWithCASNumber().properties],
        expected: [{ casNumber: CAS_NUMBER, ceNumber: CE_NUMBER }],
      },
      {
        message: 'it should return deduplicated substances',
        lines: [aLineWithCASNumber().properties, aLineWithCASNumber().properties],
        expected: [{ casNumber: CAS_NUMBER, ceNumber: undefined }],
      },
    ])('$message', ({ lines, expected }) => {
      expect(CasAndCeRulesService.getSubstancesCasAndCe(lines)).toEqual(expected);
    });
  });
});
