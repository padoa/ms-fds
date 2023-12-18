import { describe, expect, it } from 'vitest';

import { ExtractionToolsService } from '@topics/engine/rules/extraction-rules/extraction-tools.service.js';
import type { IGetTextMatchingRegExpOptions, IMatchedText } from '@topics/engine/rules/extraction-rules/extraction-rules.model.js';
import { TextCleanerService } from '@topics/engine/text-cleaner.service.js';

describe('ExtractionToolsService tests', () => {
  describe('GetAllRawTextMatchingRegExp tests', () => {
    it('should throw an error when regexp is not global', () => {
      expect(() => ExtractionToolsService.getAllTextsMatchingRegExp(/foo/, { rawText: '', cleanText: '' })).toThrow();
    });

    it.each<{ message: string; regExp: RegExp; input: Omit<IGetTextMatchingRegExpOptions, 'cleanText'>; expectedRawTexts: string[] }>([
      {
        message: 'should return an empty list when texts are undefined',
        regExp: /a/g,
        input: { rawText: undefined },
        expectedRawTexts: [],
      },
      {
        message: 'should return an empty when regExp does not match clean text',
        regExp: /foo/g,
        input: { rawText: 'ABC' },
        expectedRawTexts: [],
      },
      {
        message: 'should return all rawText when regExp matches clean text',
        regExp: /foo/g,
        input: { rawText: 'abc...FoO...DEF...FOO...foo...' },
        expectedRawTexts: ['FoO', 'FOO', 'foo'],
      },
      {
        message: 'should end the loop and return all matches when MAX_MATCH_ITERATIONS is reached',
        regExp: /foo/g,
        input: { rawText: '...FOO...'.repeat(200) },
        expectedRawTexts: Array(ExtractionToolsService.MAX_MATCH_ITERATIONS).fill('FOO'),
      },
    ])('$message', ({ regExp, input, expectedRawTexts }) => {
      const payload: IGetTextMatchingRegExpOptions = { ...input, cleanText: TextCleanerService.cleanRawText(input.rawText) };
      const expected = expectedRawTexts.map((rawText) => ({ rawText, cleanText: TextCleanerService.cleanRawText(rawText) }));

      expect(ExtractionToolsService.getAllTextsMatchingRegExp(regExp, payload)).toEqual(expected);
    });
  });

  describe('GetRawTextMatchingRegExp tests', () => {
    it('should throw an error when capturing group is not an existing list index', () => {
      expect(() => ExtractionToolsService.getTextMatchingRegExp(/foo/, { rawText: 'foo', cleanText: 'foo', capturingGroup: 2000 })).toThrow();
    });

    it.each<{ message: string; regExp: RegExp; input: Omit<IGetTextMatchingRegExpOptions, 'cleanText'>; expectedRawText: string }>([
      {
        message: 'should return null when texts are undefined',
        regExp: /a/,
        input: { rawText: undefined },
        expectedRawText: null,
      },
      {
        message: 'should return null when regExp does not match clean text',
        regExp: /foo/,
        input: { rawText: 'ABC' },
        expectedRawText: null,
      },
      {
        message: 'should return rawText when regExp matches clean text',
        regExp: /foo/,
        input: { rawText: 'abc...FoO...DEF' },
        expectedRawText: 'FoO',
      },
      {
        message: 'should return first rawText to match regex',
        regExp: /foo/,
        input: { rawText: 'FOO...FoO...foo' },
        expectedRawText: 'FOO',
      },
      {
        message: 'should return correct rawText when capturing group is specified',
        regExp: /(ab)(cd)/,
        input: { rawText: 'AbCd', capturingGroup: 2 },
        expectedRawText: 'Cd',
      },
      {
        message: 'should return null when capturing group does not match',
        regExp: /(ab)(cd)/,
        input: { rawText: 'TextText', capturingGroup: 2 },
        expectedRawText: null,
      },
    ])('$message', ({ regExp, input, expectedRawText }) => {
      const payload: IGetTextMatchingRegExpOptions = { ...input, cleanText: TextCleanerService.cleanRawText(input.rawText) };
      const expected: IMatchedText = expectedRawText
        ? { rawText: expectedRawText, cleanText: TextCleanerService.cleanRawText(expectedRawText) }
        : null;

      expect(ExtractionToolsService.getTextMatchingRegExp(regExp, payload)).toEqual(expected);
    });
  });
});
