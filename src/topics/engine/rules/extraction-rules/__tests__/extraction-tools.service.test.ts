import { describe, expect, it } from 'vitest';

import { ExtractionToolsService } from '@topics/engine/rules/extraction-rules/extraction-tools.service.js';
import type { IGetRawTextMatchingRegExp } from '@topics/engine/rules/extraction-rules/extraction-rules.model.js';
import { TextCleanerService } from '@topics/engine/text-cleaner.service.js';

describe('ExtractionToolsService tests', () => {
  describe('GetAllRawTextMatchingRegExp tests', () => {
    it('should throw an error when regexp is not global', () => {
      expect(() => ExtractionToolsService.getAllRawTextMatchingRegExp({ rawText: '', cleanText: '', regExp: /foo/ })).toThrow();
    });

    it.each<{ message: string; input: Omit<IGetRawTextMatchingRegExp, 'cleanText'>; expected: string[] }>([
      {
        message: 'should return an empty list when texts are undefined',
        input: { rawText: undefined, regExp: /a/g },
        expected: [],
      },
      {
        message: 'should return an empty when regExp does not match clean text',
        input: { rawText: 'ABC', regExp: /foo/g },
        expected: [],
      },
      {
        message: 'should return all rawText when regExp matches clean text',
        input: { rawText: 'abc...FoO...DEF...FOO...foo...', regExp: /foo/g },
        expected: ['FoO', 'FOO', 'foo'],
      },
    ])('$message', ({ input, expected }) => {
      expect(ExtractionToolsService.getAllRawTextMatchingRegExp({ ...input, cleanText: TextCleanerService.cleanRawText(input.rawText) })).toEqual(
        expected,
      );
    });
  });

  describe('GetRawTextMatchingRegExp tests', () => {
    it.each<{ message: string; input: Omit<IGetRawTextMatchingRegExp, 'cleanText'>; expected: string }>([
      {
        message: 'should return null when texts are undefined',
        input: { rawText: undefined, regExp: /a/ },
        expected: null,
      },
      {
        message: 'should return null when regExp does not match clean text',
        input: { rawText: 'ABC', regExp: /foo/ },
        expected: null,
      },
      {
        message: 'should return rawText when regExp matches clean text',
        input: { rawText: 'abc...FoO...DEF', regExp: /foo/ },
        expected: 'FoO',
      },
    ])('$message', ({ input, expected }) => {
      expect(ExtractionToolsService.getRawTextMatchingRegExp({ ...input, cleanText: TextCleanerService.cleanRawText(input.rawText) })).toEqual(
        expected,
      );
    });
  });
});
