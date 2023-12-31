import type { IExtractedData } from '@padoa/chemical-risk';

import { ExtractionRulesService } from '@topics/engine/rules/extraction-rules.service.js';
import { PdfParserService } from '@topics/engine/pdf-parser/pdf-parser.service.js';
import { FdsTreeBuilderService } from '@topics/engine/transformer/fds-tree-builder.service.js';
import { FdsTreeCleanerService } from '@topics/engine/transformer/fds-tree-cleaner.service.js';
import logger from '@helpers/logger.js';

export class FdsEngineService {
  public static async extractDataFromFds(fdsFilePath: string): Promise<{
    dataExtracted: IExtractedData;
    fromImage: boolean;
  }> {
    try {
      const { lines, strokes, fromImage } = await PdfParserService.parsePDF(fdsFilePath);
      const { fdsTree, xCounts, fullText } = FdsTreeBuilderService.buildFdsTree({ lines, strokes });
      const fdsTreeCleaned = FdsTreeCleanerService.cleanFdsTree(fdsTree, { xCounts, fromImage });
      const dataExtracted = await ExtractionRulesService.extract({ fdsTreeCleaned, fullText });
      return { dataExtracted, fromImage };
    } catch (error) {
      logger.error({ error, fdsFilePath }, `FDS engine failed extracting data from ${fdsFilePath}`);
      return { dataExtracted: null, fromImage: null };
    }
  }
}
