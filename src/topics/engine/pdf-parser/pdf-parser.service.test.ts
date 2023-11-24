import type { SpyInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ILine, IPdfData } from '@topics/engine/model/fds.model.js';
import { PdfParserService } from '@topics/engine/pdf-parser/pdf-parser.service.js';
import type { IParseResult } from '@topics/engine/pdf-parser/pdf-parser.model.js';
import { PdfTextExtractorService } from '@topics/engine/pdf-extractor/pdf-text-extractor.service.js';
import { PdfImageTextExtractorService } from '@topics/engine/pdf-extractor/pdf-image-text-extractor.service.js';

describe('PdfParser tests', () => {
  describe('parsePdfText tests', () => {
    let isPdfParsableSpy: SpyInstance<[pdfData: IPdfData], boolean>;
    let getTextFromPdfDataSpy: SpyInstance<[pdfData: IPdfData], ILine[]>;
    let getTextFromImagePdfSpy: SpyInstance<[string, { numberOfPagesToParse?: number }?], Promise<ILine[]>>;

    const linesData: ILine[] = [
      {
        texts: [
          {
            content: 'test',
            x: 0,
            y: 0,
          },
        ],
        x: 0,
        y: 0,
      },
    ];

    beforeEach(() => {
      isPdfParsableSpy = vi.spyOn(PdfTextExtractorService, 'isPdfParsable');
      getTextFromPdfDataSpy = vi.spyOn(PdfTextExtractorService, 'getTextFromPdfData');
      getTextFromImagePdfSpy = vi.spyOn(PdfImageTextExtractorService, 'getTextFromImagePdf');
    });

    afterEach(() => {
      isPdfParsableSpy.mockRestore();
      getTextFromPdfDataSpy.mockRestore();
      getTextFromImagePdfSpy.mockRestore();
    });

    describe('Readable Pdf tests', () => {
      beforeEach(() => {
        isPdfParsableSpy.mockImplementationOnce((): boolean => true);
        getTextFromPdfDataSpy.mockImplementationOnce((): ILine[] => linesData);
      });

      it('should return pdf text as lines when providing an image pdf', async () => {
        const pdfData: IPdfData = {} as IPdfData;
        const expected: IParseResult = {
          fromImage: false,
          lines: linesData,
        };

        await expect(PdfParserService.parsePdfText('fdsFilePath', pdfData)).resolves.toEqual(expected);
        expect(isPdfParsableSpy).toHaveBeenCalledWith(pdfData);
        expect(isPdfParsableSpy).toHaveBeenCalledOnce();
        expect(getTextFromPdfDataSpy).toHaveBeenCalledOnce();
        expect(getTextFromPdfDataSpy).toHaveBeenCalledWith(pdfData);
        expect(getTextFromImagePdfSpy).not.toHaveBeenCalled();
      });
    });

    describe('Pdf Images tests', () => {
      beforeEach(() => {
        isPdfParsableSpy.mockImplementationOnce((): boolean => false);
        getTextFromImagePdfSpy.mockImplementationOnce(async (): Promise<ILine[]> => Promise.resolve(linesData));
      });

      it('should return pdf text as lines when providing a pdf', async () => {
        const fdsFilePath = 'fdsFilePath';
        const pdfData: IPdfData = { Pages: [{}] } as IPdfData;
        const expected: IParseResult = {
          fromImage: true,
          lines: linesData,
        };

        await expect(PdfParserService.parsePdfText(fdsFilePath, pdfData)).resolves.toEqual(expected);
        expect(isPdfParsableSpy).toHaveBeenCalledWith(pdfData);
        expect(isPdfParsableSpy).toHaveBeenCalledOnce();
        expect(getTextFromPdfDataSpy).not.toHaveBeenCalled();
        expect(getTextFromImagePdfSpy).toHaveBeenCalledWith(fdsFilePath, { numberOfPagesToParse: 1 });
        expect(getTextFromImagePdfSpy).toHaveBeenCalledOnce();
      });
    });
  });
});
