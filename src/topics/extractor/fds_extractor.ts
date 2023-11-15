import type { IExtractedData } from '@topics/extractor/model/fds.model.js';
import { buildFdsTree } from '@topics/extractor/transformer/fds_tree_builder.js';
import { cleanFDSTree } from '@topics/extractor/transformer/fds_tree_cleaner.js';
import { applyExtractionRules } from '@topics/extractor/rules/extraction_rules.js';
import { parsePDF } from '@topics/extractor/parser/pdf_parser.js';

export const extractDataFromFDS = async (
  fdsFilePath: string,
): Promise<{
  dataExtracted: IExtractedData;
  fromImage: boolean;
}> => {
  const { lines, fromImage } = await parsePDF(fdsFilePath);
  const { fdsTree, xCounts, fullText } = buildFdsTree(lines);
  const fdsTreeCleaned = cleanFDSTree(fdsTree, { xCounts, fromImage });
  const dataExtracted = await applyExtractionRules({ fdsTreeCleaned, fullText });
  return { dataExtracted, fromImage };
};
