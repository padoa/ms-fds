import { describe, expect, it } from 'vitest';

import { PdfTextExtractorService } from '@topics/engine/pdf-extractor/pdf-text-extractor.service.js';
import { fdsKleenFirstPagePdfData } from '@topics/engine/pdf-extractor/__tests__/pdf-text-extractor.test-setup.js';

describe('PdfTextExtractorService tests', () => {
  describe('getTextFromPdfData tests', () => {
    it('should return text from pdf', () => {
      expect(PdfTextExtractorService.getTextFromPdfData(fdsKleenFirstPagePdfData)).toMatchSnapshot();
    });
  });
});
