import type { IExtractedData } from '@topics/engine/model/fds.model.js';
import { buildFdsTree } from '@topics/engine/transformer/fds_tree_builder.js';
import { cleanFDSTree } from '@topics/engine/transformer/fds_tree_cleaner.js';
import { applyExtractionRules } from '@topics/engine/rules/extraction_rules.js';
import { parsePDF } from '@topics/engine/parser/pdf_parser.js';

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
