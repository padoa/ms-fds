import type { SpyInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FdsEngineService } from '@topics/engine/fds-engine.service.js';
import { FDS_TEST_FILES_PATH } from '@src/__fixtures__/fixtures.constants.js';
import { ExtractionRulesService } from '@topics/engine/rules/extraction-rules.service.js';
import { FdsTreeCleanerService } from '@topics/engine/transformer/fds-tree-cleaner.service.js';
import { FdsTreeBuilderService } from '@topics/engine/transformer/fds-tree-builder.service.js';
import { PdfParserService } from '@topics/engine/pdf-parser/pdf-parser.service.js';

describe('FdsEngine tests', () => {
  describe('ExtractDataFromFds tests', () => {
    it('should extract data from a pdf Fds file', async () => {
      await expect(FdsEngineService.extractDataFromFds(FDS_TEST_FILES_PATH.PDF_JEFFACLEAN)).resolves.toMatchSnapshot();
    });

    describe('Error cases', () => {
      let parsePDFSpy: SpyInstance;
      let buildFdsTreeSpy: SpyInstance;
      let cleanFdsTreeSpy: SpyInstance;
      let extractSpy: SpyInstance;

      beforeEach(() => {
        parsePDFSpy = vi.spyOn(PdfParserService, 'parsePDF');
        buildFdsTreeSpy = vi.spyOn(FdsTreeBuilderService, 'buildFdsTree');
        cleanFdsTreeSpy = vi.spyOn(FdsTreeCleanerService, 'cleanFdsTree');
        extractSpy = vi.spyOn(ExtractionRulesService, 'extract');
      });

      afterEach(() => {
        buildFdsTreeSpy.mockRestore();
        parsePDFSpy.mockRestore();
        cleanFdsTreeSpy.mockRestore();
        extractSpy.mockRestore();
      });

      it('should handle error when the parsing crashes', async () => {
        parsePDFSpy.mockImplementation(() => {
          throw new Error();
        });
        expect(await FdsEngineService.extractDataFromFds(FDS_TEST_FILES_PATH.PDF_JEFFACLEAN)).toEqual({ dataExtracted: null, fromImage: null });
      });

      it('should handle error when the tree builder crashes', async () => {
        buildFdsTreeSpy.mockImplementation(() => {
          throw new Error();
        });
        expect(await FdsEngineService.extractDataFromFds(FDS_TEST_FILES_PATH.PDF_JEFFACLEAN)).toEqual({ dataExtracted: null, fromImage: null });
      });

      it('should handle error when the cleaning crashes', async () => {
        cleanFdsTreeSpy.mockImplementation(() => {
          throw new Error();
        });
        expect(await FdsEngineService.extractDataFromFds(FDS_TEST_FILES_PATH.PDF_JEFFACLEAN)).toEqual({ dataExtracted: null, fromImage: null });
      });

      it('should handle error when the extraction crashes', async () => {
        extractSpy.mockImplementation(() => {
          throw new Error();
        });
        expect(await FdsEngineService.extractDataFromFds(FDS_TEST_FILES_PATH.PDF_JEFFACLEAN)).toEqual({ dataExtracted: null, fromImage: null });
      });
    });

    it('should extract data from an image Fds file', async () => {
      await expect(FdsEngineService.extractDataFromFds(FDS_TEST_FILES_PATH.IMAGE_DEGRAISSANT)).resolves.toMatchSnapshot();
    });
  }, 70000);
});
