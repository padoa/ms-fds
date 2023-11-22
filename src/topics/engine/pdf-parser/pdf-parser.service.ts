import Pdfparser from 'pdf2json';

import type { ILine, IPdfData } from '@topics/engine/model/fds.model.js';
import { MAX_PAGE_NUMBER_TO_PARSE } from '@topics/engine/pdf-parser/pdf-parser.constants.js';
import type { IParseResult } from '@topics/engine/pdf-parser/pdf-parser.model.js';
import { PdfTextExtractorService } from '@topics/engine/pdf-extractor/pdf-text-extractor.service.js';
import { getTextFromImagePdf } from '@topics/engine/pdf-extractor/pdf-image-text-extractor.service.js';

export class PdfParserService {
  private static pdfParser: Pdfparser = new Pdfparser();

  public static parsePDF(fdsFilePath: string): Promise<IParseResult> {
    return new Promise((resolve, reject) => {
      this.pdfParser.on('pdfParser_dataReady', async (pdfData: IPdfData) => resolve(await this.parsePdfText(fdsFilePath, pdfData)));
      this.pdfParser.on('pdfParser_dataError', (errData) => reject(errData));

      // eslint-disable-next-line no-promise-executor-return
      return this.pdfParser.loadPDF(fdsFilePath);
    });
  }

  public static async parsePdfText(fdsFilePath: string, pdfData: IPdfData): Promise<IParseResult> {
    const pdfIsParsable = PdfTextExtractorService.isPdfParsable(pdfData);
    return {
      fromImage: !pdfIsParsable,
      lines: pdfIsParsable ? this.parseReadablePdf(pdfData) : await this.parseImagePdf(fdsFilePath, pdfData),
    };
  }

  public static parseReadablePdf(pdfData: IPdfData): ILine[] {
    return PdfTextExtractorService.getTextFromPdfData(pdfData);
  }

  public static async parseImagePdf(fdsFilePath: string, pdfData: IPdfData): Promise<ILine[]> {
    return getTextFromImagePdf(fdsFilePath, { numberOfPagesToParse: Math.min(pdfData.Pages.length, MAX_PAGE_NUMBER_TO_PARSE) });
  }
}
