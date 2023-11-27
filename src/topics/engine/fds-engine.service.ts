import type { IExtractedData } from '@topics/engine/model/fds.model.js';
import { cleanFDSTree } from '@topics/engine/transformer/fds-tree-cleaner.js';
import { applyExtractionRules } from '@topics/engine/rules/extraction-rules.js';
import { PdfParserService } from '@topics/engine/pdf-parser/pdf-parser.service.js';
import { FDSTreeBuilderService } from '@topics/engine/transformer/fds-tree-builder.service.js';

export class FDSEngineService {
  public static async extractDataFromFDS(fdsFilePath: string): Promise<{
    dataExtracted: IExtractedData;
    fromImage: boolean;
  }> {
    const { lines, pageDimension, fromImage } = await PdfParserService.parsePDF(fdsFilePath);
    const { fdsTree, xCounts, fullText } = FDSTreeBuilderService.buildFdsTree(lines);
    const fdsTreeCleaned = cleanFDSTree(fdsTree, { xCounts, fromImage });
    const dataExtracted = await applyExtractionRules({ fdsTreeCleaned, fullText, pageDimension });
    return { dataExtracted, fromImage };
  }
}
