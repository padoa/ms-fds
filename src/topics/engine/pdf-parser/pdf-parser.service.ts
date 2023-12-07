import Pdfparser from 'pdf2json';

import type { IPdfData } from '@topics/engine/model/fds.model.js';
import { MAX_PAGE_NUMBER_TO_PARSE } from '@topics/engine/pdf-parser/pdf-parser.constants.js';
import type { IParseResult } from '@topics/engine/pdf-parser/pdf-parser.model.js';
import { PdfTextExtractorService } from '@topics/engine/pdf-extractor/pdf-text-extractor.service.js';
import { PdfImageTextExtractorService } from '@topics/engine/pdf-extractor/pdf-image-text-extractor.service.js';
import { PdfStrokeExtractorService } from '@topics/engine/pdf-extractor/pdf-stroke-extractor.service.js';

export class PdfParserService {
  public static async parsePDF(fdsFilePath: string): Promise<IParseResult> {
    const pdfParser = new Pdfparser();

    const result: Promise<IParseResult> = new Promise((resolve, reject) => {
      pdfParser.on('pdfParser_dataReady', async (pdfData) => resolve(await this.parsePdfText(fdsFilePath, pdfData as unknown as IPdfData))); // Force typing because typing of the lib is broken
      pdfParser.on('pdfParser_dataError', (errData) => reject(errData));
    });
    await pdfParser.loadPDF(fdsFilePath);
    return result;
  }

  public static async parsePdfText(fdsFilePath: string, pdfData: IPdfData): Promise<IParseResult> {
    const pdfIsParsable = PdfTextExtractorService.isPdfParsable(pdfData);
    return {
      fromImage: !pdfIsParsable,
      lines: pdfIsParsable
        ? PdfTextExtractorService.getTextFromPdfData(pdfData)
        : await PdfImageTextExtractorService.getTextFromImagePdf(fdsFilePath, {
            numberOfPagesToParse: Math.min(pdfData.Pages.length, MAX_PAGE_NUMBER_TO_PARSE),
          }),
      strokes: pdfIsParsable ? PdfStrokeExtractorService.getStrokesFromPdfData(pdfData) : [],
    };
  }
}
