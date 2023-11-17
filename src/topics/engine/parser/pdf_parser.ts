import Pdfparser from 'pdf2json';

import type { ILine, IPdfData } from '@topics/engine/model/fds.model.js';
import { getTextFromImagePdf } from '@topics/engine/parser/pdf_image_to_text.js';
import { getTextFromPdfData, isPdfParsable } from '@topics/engine/parser/text_from_pdf.js';

export const parsePDF = async (fdsFilePath: string): Promise<{ lines: ILine[]; fromImage: boolean }> => {
  return new Promise((resolve, reject) => {
    const pdfParser = new Pdfparser();
    pdfParser.on('pdfParser_dataReady', async (pdfData: IPdfData) => {
      const pdfIsParsable = isPdfParsable(pdfData);
      if (pdfIsParsable) {
        resolve({ lines: getTextFromPdfData(pdfData), fromImage: false });
      } else {
        const numberOfPages = pdfData.Pages.length;
        const lines = await getTextFromImagePdf(fdsFilePath, { numberOfPagesToParse: Math.min(numberOfPages, 5) }); // Limit to 5 to improve perf
        resolve({ lines, fromImage: true });
      }
    });
    pdfParser.on('pdfParser_dataError', (errData) => reject(errData));
    return pdfParser.loadPDF(fdsFilePath);
  });
};
