import { describe, expect, it } from 'vitest';

import { getTextFromImagePdf } from '@topics/engine/pdf-extractor/pdf-image-text-extractor.service.js';

describe('PdfImageTextExtractorService tests', () => {
  describe('getTextFromImagePdf tests', () => {
    const imageArgonPdfPath = `${process.cwd()}/resources/test-files/images/2549-fds-2017-argon.pdf`;

    it('should return text from image pdf', async () => {
      await expect(getTextFromImagePdf(imageArgonPdfPath, { numberOfPagesToParse: 1 })).resolves.toMatchSnapshot();
    });

    it('should return an empty list when numberOfPagesToParse is not specified', async () => {
      await expect(getTextFromImagePdf(imageArgonPdfPath)).resolves.toEqual([]);
    });
  });
});
