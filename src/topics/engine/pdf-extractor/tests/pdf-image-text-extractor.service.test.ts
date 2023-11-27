import { describe, expect, it } from 'vitest';

import { PdfImageTextExtractorService } from '@topics/engine/pdf-extractor/pdf-image-text-extractor.service.js';

describe('PdfImageTextExtractorService tests', () => {
  describe('getTextFromImagePdf tests', () => {
    const imageArgonPdfPath = `${process.cwd()}/resources/test-files/images/image-argon.pdf`;

    it('should return text from image pdf', async () => {
      await expect(
        PdfImageTextExtractorService.getTextAndDimensionFromImagePdf(imageArgonPdfPath, { numberOfPagesToParse: 1 }),
      ).resolves.toMatchSnapshot();
    });

    it('should return an empty list when numberOfPagesToParse is not specified', async () => {
      await expect(PdfImageTextExtractorService.getTextAndDimensionFromImagePdf(imageArgonPdfPath)).resolves.toEqual({
        lines: [],
        pageDimension: null,
      });
    });
  });
});
