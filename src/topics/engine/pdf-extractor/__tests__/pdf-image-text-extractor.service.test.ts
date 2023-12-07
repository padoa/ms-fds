import { describe, expect, it } from 'vitest';

import { PdfImageTextExtractorService } from '@topics/engine/pdf-extractor/pdf-image-text-extractor.service.js';
import { FDS_TEST_FILES_PATH } from '@src/__fixtures__/fixtures.constants.js';

describe('PdfImageTextExtractorService tests', () => {
  describe('getTextFromImagePdf tests', () => {
    it('should return text from image pdf', async () => {
      await expect(
        PdfImageTextExtractorService.getTextFromImagePdf(FDS_TEST_FILES_PATH.IMAGE_DEGRAISSANT, { numberOfPagesToParse: 1 }),
      ).resolves.toMatchSnapshot();
    });

    it('should return an empty list when numberOfPagesToParse is not specified', async () => {
      await expect(PdfImageTextExtractorService.getTextFromImagePdf(FDS_TEST_FILES_PATH.IMAGE_DEGRAISSANT)).resolves.toEqual([]);
    });
  });
});
