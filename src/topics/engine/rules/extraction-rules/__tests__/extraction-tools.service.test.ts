import { describe, expect, it } from 'vitest';

import { ExtractionToolsService } from '@topics/engine/rules/extraction-rules/extraction-tools.service.js';
import type { IGetRawTextMatchingRegExp, IMatchedText } from '@topics/engine/rules/extraction-rules/extraction-rules.model.js';
import { TextCleanerService } from '@topics/engine/text-cleaner.service.js';

describe('ExtractionToolsService tests', () => {
  describe('GetAllRawTextMatchingRegExp tests', () => {
    it('should throw an error when regexp is not global', () => {
      expect(() => ExtractionToolsService.getAllTextsMatchingRegExp({ rawText: '', cleanText: '', regExp: /foo/ })).toThrow();
    });

    it.each<{ message: string; input: Omit<IGetRawTextMatchingRegExp, 'cleanText'>; expectedRawTexts: string[] }>([
      {
        message: 'should return an empty list when texts are undefined',
        input: { rawText: undefined, regExp: /a/g },
        expectedRawTexts: [],
      },
      {
        message: 'should return an empty when regExp does not match clean text',
        input: { rawText: 'ABC', regExp: /foo/g },
        expectedRawTexts: [],
      },
      {
        message: 'should return all rawText when regExp matches clean text',
        input: { rawText: 'abc...FoO...DEF...FOO...foo...', regExp: /foo/g },
        expectedRawTexts: ['FoO', 'FOO', 'foo'],
      },
      {
        message: 'should end the loop and return all matches when MAX_MATCH_ITERATIONS is reached',
        input: { rawText: '...FOO...'.repeat(200), regExp: /foo/g },
        expectedRawTexts: Array(ExtractionToolsService.MAX_MATCH_ITERATIONS).fill('FOO'),
      },
    ])('$message', ({ input, expectedRawTexts }) => {
      const payload: IGetRawTextMatchingRegExp = { ...input, cleanText: TextCleanerService.cleanRawText(input.rawText) };
      const expected = expectedRawTexts.map((rawText) => ({ rawText, cleanText: TextCleanerService.cleanRawText(rawText) }));

      expect(ExtractionToolsService.getAllTextsMatchingRegExp(payload)).toEqual(expected);
    });
  });

  describe('GetRawTextMatchingRegExp tests', () => {
    it('should throw an error when capturing group is not an existing list index', () => {
      expect(() => ExtractionToolsService.getTextMatchingRegExp({ rawText: 'foo', cleanText: 'foo', regExp: /foo/, capturingGroup: 2000 })).toThrow();
    });

    it.each<{ message: string; input: Omit<IGetRawTextMatchingRegExp, 'cleanText'>; expectedRawText: string }>([
      {
        message: 'should return null when texts are undefined',
        input: { rawText: undefined, regExp: /a/ },
        expectedRawText: null,
      },
      {
        message: 'should return null when regExp does not match clean text',
        input: { rawText: 'ABC', regExp: /foo/ },
        expectedRawText: null,
      },
      {
        message: 'should return rawText when regExp matches clean text',
        input: { rawText: 'abc...FoO...DEF', regExp: /foo/ },
        expectedRawText: 'FoO',
      },
      {
        message: 'should return first rawText to match regex',
        input: { rawText: 'FOO...FoO...foo', regExp: /foo/ },
        expectedRawText: 'FOO',
      },
      {
        message: 'should return correct rawText when capturing group is specified',
        input: { rawText: 'AbCd', regExp: /(ab)(cd)/, capturingGroup: 2 },
        expectedRawText: 'Cd',
      },
    ])('$message', ({ input, expectedRawText }) => {
      const payload: IGetRawTextMatchingRegExp = { ...input, cleanText: TextCleanerService.cleanRawText(input.rawText) };
      const expected: IMatchedText = expectedRawText
        ? { rawText: expectedRawText, cleanText: TextCleanerService.cleanRawText(expectedRawText) }
        : null;

      expect(ExtractionToolsService.getTextMatchingRegExp(payload)).toEqual(expected);
    });
  });
});
