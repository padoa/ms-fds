import Pdfparser from 'pdf2json';

import type { IPdfData } from '@topics/engine/model/fds.model.js';
import { MAX_PAGE_NUMBER_TO_PARSE } from '@topics/engine/pdf-parser/pdf-parser.constants.js';
import type { IParseResult } from '@topics/engine/pdf-parser/pdf-parser.model.js';
import { PdfTextExtractorService } from '@topics/engine/pdf-extractor/pdf-text-extractor.service.js';
import { PdfImageTextExtractorService } from '@topics/engine/pdf-extractor/pdf-image-text-extractor.service.js';

export class PdfParserService {
  public static async parsePDF(fdsFilePath: string): Promise<IParseResult> {
    const pdfParser = new Pdfparser();

    const result: Promise<IParseResult> = new Promise((resolve, reject) => {
      pdfParser.on('pdfParser_dataReady', async (pdfData: IPdfData) => resolve(await this.parsePdfText(fdsFilePath, pdfData)));
      pdfParser.on('pdfParser_dataError', (errData) => reject(errData));
    });
    await pdfParser.loadPDF(fdsFilePath);
    return result;
  }

  public static async parsePdfText(fdsFilePath: string, pdfData: IPdfData): Promise<IParseResult> {
    const pdfIsParsable = PdfTextExtractorService.isPdfParsable(pdfData);
    const { lines, pageDimension } = pdfIsParsable
      ? PdfTextExtractorService.getTextAndDimensionFromPdfData(pdfData)
      : await PdfImageTextExtractorService.getTextAndDimensionFromImagePdf(fdsFilePath, {
          numberOfPagesToParse: Math.min(pdfData.Pages.length, MAX_PAGE_NUMBER_TO_PARSE),
        });
    return {
      pageDimension,
      fromImage: !pdfIsParsable,
      lines,
    };
  }
}
