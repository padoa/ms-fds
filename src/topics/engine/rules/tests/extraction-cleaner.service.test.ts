import { describe, expect, it } from 'vitest';

import { ExtractionCleanerService } from '@topics/engine/rules/extraction-cleaner.service.js';

describe('Extraction cleaner service tests', () => {
  describe('trimAndCleanTrailingDot', () => {
    it.each<{ input: string; expected: string }>([
      { input: 'FDS ', expected: 'FDS' },
      { input: 'FDS SaaS.', expected: 'FDS SaaS' },
      { input: 'FDS SaaS. ', expected: 'FDS SaaS' },
      { input: 'FDS S.A.S.', expected: 'FDS S.A.S.' },
      { input: 'FDS S.A.S. ', expected: 'FDS S.A.S.' },
    ])('should return $expected with input $input', ({ input, expected }) => {
      expect(ExtractionCleanerService.trimAndCleanTrailingDot(input)).toEqual(expected);
    });
  });
});
