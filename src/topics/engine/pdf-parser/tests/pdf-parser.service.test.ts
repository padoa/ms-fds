import type { SpyInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ILine, IPageDimension, IPdfData } from '@topics/engine/model/fds.model.js';
import { PdfParserService } from '@topics/engine/pdf-parser/pdf-parser.service.js';
import type { IParseResult } from '@topics/engine/pdf-parser/pdf-parser.model.js';
import { PdfTextExtractorService } from '@topics/engine/pdf-extractor/pdf-text-extractor.service.js';
import { PdfImageTextExtractorService } from '@topics/engine/pdf-extractor/pdf-image-text-extractor.service.js';
import type { IExtractorResult } from '@topics/engine/pdf-extractor/pdf-extractor.model.js';

describe('PdfParser tests', () => {
  describe('parsePdfText tests', () => {
    let isPdfParsableSpy: SpyInstance<[pdfData: IPdfData], boolean>;
    let getTextAndDimensionFromPdfDataSpy: SpyInstance<[pdfData: IPdfData], IExtractorResult>;
    let getTextAndDimensionFromImagePdfSpy: SpyInstance<[string, { numberOfPagesToParse?: number }?], Promise<IExtractorResult>>;

    const pageDimension: IPageDimension = { width: 1000, height: 1200 };
    const linesData: ILine[] = [
      {
        texts: [
          {
            content: 'test',
            x: 0,
            y: 0,
          },
        ],
        pageNumber: 1,
        startBox: { x: 0, y: 0 },
      },
    ];

    beforeEach(() => {
      isPdfParsableSpy = vi.spyOn(PdfTextExtractorService, 'isPdfParsable');
      getTextAndDimensionFromPdfDataSpy = vi.spyOn(PdfTextExtractorService, 'getTextAndDimensionFromPdfData');
      getTextAndDimensionFromImagePdfSpy = vi.spyOn(PdfImageTextExtractorService, 'getTextAndDimensionFromImagePdf');
    });

    afterEach(() => {
      isPdfParsableSpy.mockRestore();
      getTextAndDimensionFromPdfDataSpy.mockRestore();
      getTextAndDimensionFromImagePdfSpy.mockRestore();
    });

    describe('Readable Pdf tests', () => {
      beforeEach(() => {
        isPdfParsableSpy.mockImplementationOnce((): boolean => true);
        getTextAndDimensionFromPdfDataSpy.mockImplementationOnce(
          (): IExtractorResult => ({
            lines: linesData,
            pageDimension,
          }),
        );
      });

      it('should return pdf text as lines when providing an image pdf', async () => {
        const pdfData: IPdfData = {} as IPdfData;
        const expected: IParseResult = {
          pageDimension,
          fromImage: false,
          lines: linesData,
        };

        await expect(PdfParserService.parsePdfText('fdsFilePath', pdfData)).resolves.toEqual(expected);
        expect(isPdfParsableSpy).toHaveBeenCalledWith(pdfData);
        expect(isPdfParsableSpy).toHaveBeenCalledOnce();
        expect(getTextAndDimensionFromPdfDataSpy).toHaveBeenCalledOnce();
        expect(getTextAndDimensionFromPdfDataSpy).toHaveBeenCalledWith(pdfData);
        expect(getTextAndDimensionFromImagePdfSpy).not.toHaveBeenCalled();
      });
    });

    describe('Pdf Images tests', () => {
      beforeEach(() => {
        isPdfParsableSpy.mockImplementationOnce((): boolean => false);
        getTextAndDimensionFromImagePdfSpy.mockImplementationOnce(
          async (): Promise<IExtractorResult> => Promise.resolve({ lines: linesData, pageDimension }),
        );
      });

      it('should return pdf text as lines when providing a pdf', async () => {
        const fdsFilePath = 'fdsFilePath';
        const pdfData: IPdfData = { Pages: [{}] } as IPdfData;
        const expected: IParseResult = {
          pageDimension,
          fromImage: true,
          lines: linesData,
        };

        await expect(PdfParserService.parsePdfText(fdsFilePath, pdfData)).resolves.toEqual(expected);
        expect(isPdfParsableSpy).toHaveBeenCalledWith(pdfData);
        expect(isPdfParsableSpy).toHaveBeenCalledOnce();
        expect(getTextAndDimensionFromPdfDataSpy).not.toHaveBeenCalled();
        expect(getTextAndDimensionFromImagePdfSpy).toHaveBeenCalledWith(fdsFilePath, { numberOfPagesToParse: 1 });
        expect(getTextAndDimensionFromImagePdfSpy).toHaveBeenCalledOnce();
      });
    });
  });
});
