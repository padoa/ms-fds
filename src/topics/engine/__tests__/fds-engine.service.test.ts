import { describe, expect, it } from 'vitest';

import { FDSEngineService } from '@topics/engine/fds-engine.service.js';
import { FDS_TEST_FILES_PATH } from '@src/__fixtures__/fixtures.constants.js';

describe('FdsEngine tests', () => {
  describe('ExtractDataFromFDS tests', () => {
    it('should extract data from a pdf FDS file', async () => {
      await expect(FDSEngineService.extractDataFromFDS(FDS_TEST_FILES_PATH.PDF_JEFFACLEAN)).resolves.toMatchSnapshot();
    });

    it('should extract data from an image FDS file', async () => {
      await expect(FDSEngineService.extractDataFromFDS(FDS_TEST_FILES_PATH.IMAGE_DEGRAISSANT)).resolves.toMatchSnapshot();
    });
  }, 70000);
});
