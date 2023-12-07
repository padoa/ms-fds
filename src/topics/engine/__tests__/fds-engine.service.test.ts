import { describe, expect, it } from 'vitest';

import { FdsEngineService } from '@topics/engine/fds-engine.service.js';
import { FDS_TEST_FILES_PATH } from '@src/__fixtures__/fixtures.constants.js';

describe('FdsEngine tests', () => {
  describe('ExtractDataFromFds tests', () => {
    it('should extract data from a pdf Fds file', async () => {
      await expect(FdsEngineService.extractDataFromFds(FDS_TEST_FILES_PATH.PDF_JEFFACLEAN)).resolves.toMatchSnapshot();
    });

    it('should extract data from an image Fds file', async () => {
      await expect(FdsEngineService.extractDataFromFds(FDS_TEST_FILES_PATH.IMAGE_DEGRAISSANT)).resolves.toMatchSnapshot();
    });
  }, 70000);
});
