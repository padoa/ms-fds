import type { IExtractedData } from '@topics/engine/model/fds.model.js';
import { applyExtractionRules } from '@topics/engine/rules/extraction-rules.js';
import { PdfParserService } from '@topics/engine/pdf-parser/pdf-parser.service.js';
import { FDSTreeBuilderService } from '@topics/engine/transformer/fds-tree-builder.service.js';
import { FdsTreeCleanerService } from '@topics/engine/transformer/fds-tree-cleaner.service.js';

export class FDSEngineService {
  public static async extractDataFromFDS(fdsFilePath: string): Promise<{
    dataExtracted: IExtractedData;
    fromImage: boolean;
  }> {
    const { lines, fromImage } = await PdfParserService.parsePDF(fdsFilePath);
    const { fdsTree, xCounts, fullText } = FDSTreeBuilderService.buildFdsTree(lines);
    const fdsTreeCleaned = FdsTreeCleanerService.cleanFDSTree(fdsTree, { xCounts, fromImage });
    const dataExtracted = await applyExtractionRules({ fdsTreeCleaned, fullText });
    return { dataExtracted, fromImage };
  }
}
