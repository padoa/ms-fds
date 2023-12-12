import { describe, expect, it } from 'vitest';
import _ from 'lodash';

import { CommonRegexRulesService } from '@topics/engine/rules/extraction-rules/common-regex-rules.service.js';

describe('CommonRegexRulesService tests', () => {
  describe('SPACE_REGEX', () => {
    it.each<{ input: string; expected: string }>([
      { input: '', expected: '' },
      { input: ' ', expected: ' ' },
      { input: ' \t ', expected: ' \t ' },
      { input: '\n\n', expected: '\n\n' },
      { input: ' \t\n\r ', expected: ' \t\n\r ' },
      { input: '  ', expected: '  ' },
      { input: ' Hello', expected: ' ' },
      { input: 'abc', expected: '' },
      { input: ' abc ', expected: ' ' },
    ])('should return $expected with input $input', ({ input, expected }) => {
      expect(_.first(input.match(CommonRegexRulesService.SPACE_REGEX))).toEqual(expected);
    });
  });

  describe('NUMBER_WITH_OPTIONAL_DECIMAL_REGEX', () => {
    it.each<{ input: string; expected: boolean }>([
      { input: '123', expected: true },
      { input: '12.345', expected: true },
      { input: '67,89', expected: true },
      { input: '45 . 678 ', expected: true },
      { input: ' 789.123 ', expected: true },
      { input: 'abc', expected: false },
    ])('should return $expected with input $input', ({ input, expected }) => {
      expect(new RegExp(CommonRegexRulesService.NUMBER_WITH_OPTIONAL_DECIMAL_REGEX).test(input)).toEqual(expected);
    });
  });

  describe('ORDER_OPERATORS_REGEX', () => {
    it.each<{ input: string; expected: boolean }>([
      { input: '<', expected: true },
      { input: '>', expected: true },
      { input: '<=', expected: true },
      { input: '>=', expected: true },
      { input: '≤', expected: true },
      { input: '≥', expected: true },
      { input: 'supérieur', expected: true },
      { input: 'supérieure', expected: true },
      { input: 'superieur', expected: true },
      { input: 'superieure', expected: true },
      { input: 'supérieur à', expected: true },
      { input: 'superieur à', expected: true },
      { input: 'supérieure à', expected: true },
      { input: 'superieure à', expected: true },
      { input: 'inférieur', expected: true },
      { input: 'inferieur', expected: true },
      { input: 'inférieure', expected: true },
      { input: 'inferieure', expected: true },
      { input: 'inférieur à', expected: true },
      { input: 'inferieur à', expected: true },
      { input: 'inférieure à', expected: true },
      { input: 'inferieure à', expected: true },
      { input: '=', expected: false },
      { input: 'inférrieur', expected: false },
      { input: 'supérrieur', expected: false },
      { input: 'abc', expected: false },
    ])('should return $expected with input $input', ({ input, expected }) => {
      expect(new RegExp(CommonRegexRulesService.ORDER_OPERATORS_REGEX).test(input)).toEqual(expected);
    });
  });

  describe('TEMPERATURE_UNITS_REGEX', () => {
    it.each<{ input: string; expected: boolean }>([
      { input: '°c', expected: true },
      { input: '° k', expected: true },
      { input: '°', expected: false },
      { input: 'C°', expected: false },
      { input: '°X', expected: false },
      { input: '°CKF', expected: false },
      { input: 'abc', expected: false },
    ])('should return $expected with input $input', ({ input, expected }) => {
      expect(new RegExp(CommonRegexRulesService.TEMPERATURE_UNITS_REGEX).test(input)).toEqual(expected);
    });
  });
});
