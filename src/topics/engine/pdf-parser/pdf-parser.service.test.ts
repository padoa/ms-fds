import type { SpyInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ILine, IPdfData } from '@topics/engine/model/fds.model.js';
import { PdfParserService } from '@topics/engine/pdf-parser/pdf-parser.service.js';
import type { IParseResult } from '@topics/engine/pdf-parser/pdf-parser.model.js';
import { PdfTextExtractorService } from '@topics/engine/pdf-extractor/pdf-text-extractor.service.js';

describe('PdfParser tests', () => {
  describe('parsePdfText tests', () => {
    let isPdfParsableSpy: SpyInstance<[pdfData: IPdfData], boolean>;

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
    });

    afterEach(() => {
      isPdfParsableSpy.mockRestore();
    });

    describe('Readable Pdf tests', () => {
      let parseReadablePdfSpy: SpyInstance<[pdfData: IPdfData], ILine[]>;

      beforeEach(() => {
        isPdfParsableSpy.mockImplementationOnce((): boolean => true);
        parseReadablePdfSpy = vi.spyOn(PdfParserService, 'parseReadablePdf');
        parseReadablePdfSpy.mockImplementationOnce((): ILine[] => linesData);
      });

      afterEach(() => {
        parseReadablePdfSpy.mockRestore();
      });

      it('should return pdf text as lines when providing an image pdf', async () => {
        const expected: IParseResult = {
          fromImage: false,
          lines: linesData,
        };

        await expect(PdfParserService.parsePdfText('fdsFilePath', {} as IPdfData)).resolves.toEqual(expected);
        expect(isPdfParsableSpy).toHaveBeenCalledOnce();
        expect(parseReadablePdfSpy).toHaveBeenCalledOnce();
      });
    });

    describe('Pdf Images tests', () => {
      let parseImagePdfSpy: SpyInstance<[fdsFilePath: string, pdfData: IPdfData], Promise<ILine[]>>;

      beforeEach(() => {
        isPdfParsableSpy = vi.spyOn(PdfTextExtractorService, 'isPdfParsable');
        isPdfParsableSpy.mockImplementationOnce((): boolean => false);

        parseImagePdfSpy = vi.spyOn(PdfParserService, 'parseImagePdf');
        parseImagePdfSpy.mockImplementationOnce((): Promise<ILine[]> => Promise.resolve(linesData));
      });

      it('should return pdf text as lines when providing a pdf', async () => {
        const expected: IParseResult = {
          fromImage: true,
          lines: linesData,
        };

        await expect(PdfParserService.parsePdfText('fdsFilePath', {} as IPdfData)).resolves.toEqual(expected);
        expect(isPdfParsableSpy).toHaveBeenCalledOnce();
        expect(parseImagePdfSpy).toHaveBeenCalledOnce();
      });
    });
  });
});
