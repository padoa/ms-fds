import { describe, expect, it } from 'vitest';

import { TextCleanerService } from '@topics/engine/text-cleaner.service.js';

describe('TextCleanerService tests', () => {
  describe('cleanRawText tests', () => {
    it.each<{ input: string; expected: string }>([
      { input: undefined, expected: undefined },
      { input: 'FDS-ARGON', expected: 'fds-argon' },
      { input: 'Évaporation', expected: 'évaporation' },
    ])('should return $expected with input $input', ({ input, expected }) => {
      expect(TextCleanerService.cleanRawText(input)).toEqual(expected);
    });
  });

  describe('trimAndCleanTrailingDot tests', () => {
    it.each<{ input: string; expected: string }>([
      { input: 'FDS ', expected: 'FDS' },
      { input: 'FDS SaaS.', expected: 'FDS SaaS' },
      { input: 'FDS SaaS. ', expected: 'FDS SaaS' },
      { input: 'FDS S.A.S.', expected: 'FDS S.A.S.' },
      { input: 'FDS S.A.S. ', expected: 'FDS S.A.S.' },
    ])('should return $expected with input $input', ({ input, expected }) => {
      expect(TextCleanerService.trimAndCleanTrailingDot(input)).toEqual(expected);
    });
  });

  describe('cleanSpaces tests', () => {
    it.each<{ input: string; expected: string }>([
      { input: 'text ', expected: 'text' },
      { input: ' text', expected: 'text' },
      { input: ' text ', expected: 'text' },
      { input: ' there is a lot of spaces here but there wont be any left ', expected: 'thereisalotofspacesherebuttherewontbeanyleft' },
    ])('should return $expected with input $input', ({ input, expected }) => {
      expect(TextCleanerService.cleanSpaces(input)).toEqual(expected);
    });
  });

  describe('trimAndCleanMultipleSpaces tests', () => {
    it.each<{ input: string; expected: string }>([
      { input: '', expected: '' },
      { input: ' ', expected: '' },
      { input: ' text ', expected: 'text' },
      { input: 'tab\t', expected: 'tab' },
      { input: ' \t \t ', expected: '' },
      { input: ' text with spaces ', expected: 'text with spaces' },
      { input: ' text', expected: 'text' },
      { input: ' line1\nline2\n ', expected: 'line1 line2' },
      { input: ' line1\n line2 tab\t word ', expected: 'line1 line2 tab word' },
    ])('should return $expected with input $input', ({ input, expected }) => {
      expect(TextCleanerService.trimAndCleanMultipleSpaces(input)).toEqual(expected);
    });
  });
});
