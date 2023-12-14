import fsPromises from 'fs/promises';

import { decode } from 'html-entities';
import { createWorker } from 'tesseract.js';
import { promiseMapSeries } from '@padoa/promise';
import _ from 'lodash';
import type { Options } from 'pdf2pic/dist/types/options.js';
import { fromPath } from 'pdf2pic';

import type { ILine, IPageDimension, IPosition, IText } from '@topics/engine/model/fds.model.js';
import { TextCleanerService } from '@topics/engine/text-cleaner.service.js';

export class PdfImageTextExtractorService {
  public static async getTextFromImagePdf(fdsFilePath: string, { numberOfPagesToParse }: { numberOfPagesToParse?: number } = {}): Promise<ILine[]> {
    const options = await this.pdfToImage(fdsFilePath, { numberOfPagesToParse });

    const worker = await createWorker('fra');
    const texts = await promiseMapSeries(_.range(0, numberOfPagesToParse), async (index) => {
      return this.getTextFromImage(worker, index + 1, options);
    });
    await worker.terminate();
    await fsPromises.rm(options.savePath, { recursive: true });

    return _.flatMap(texts);
  }

  private static pdfToImage = async (pathToFile: string, { numberOfPagesToParse }: { numberOfPagesToParse: number }): Promise<Options> => {
    const options = await this.getPdf2PicOptions();
    await fromPath(pathToFile, options).bulk(_.range(1, numberOfPagesToParse + 2), { responseType: 'image' });
    return options;
  };

  private static async getPdf2PicOptions(): Promise<Options> {
    const savePath = `/tmp/fds/${new Date().getTime().toString()}`;
    await fsPromises.mkdir(savePath, { recursive: true });

    return {
      density: 300,
      savePath,
      saveFilename: 'fds-image',
      format: 'png',
      width: 1050,
      height: 1485,
    };
  }

  private static getTextFromImage = async (
    worker: Tesseract.Worker,
    pageNumber: number,
    { savePath, saveFilename, format }: Options,
  ): Promise<ILine[]> => {
    const imagePath = `${savePath}/${saveFilename}.${pageNumber}.${format}`;
    const ret = await worker.recognize(imagePath);
    return this.hocrToLines(ret.data.hocr, pageNumber);
  };

  private static hocrToLines = (hocr: string, pageNumber: number): ILine[] => {
    const hocrByLine = hocr.split('\n');
    const pageDimension = this.getHocrPageDimension(_.first(hocrByLine));

    return _.reduce(
      hocrByLine,
      (lines, hocrElement) => {
        if (this.isHocrElementAWord(hocrElement)) {
          const text = this.getTextInHocrWordElement(hocrElement, { pageNumber, pageDimension });
          const lastLine = _.last(lines);
          lastLine.texts.push(text);
          return lines;
        }

        if (this.isHocrElementALine(hocrElement)) {
          const startBox = this.getStartBoxInHocrElement(hocrElement, { pageNumber, pageDimension });
          const endBox = this.getEndBoxInHocrElement(hocrElement, { pageNumber, pageDimension });
          lines.push({ startBox, endBox, texts: [] });
          return lines;
        }

        return lines;
      },
      [] as ILine[],
    );
  };

  private static isHocrElementALine = (hocrElement: string): boolean => {
    return hocrElement.trim().startsWith("<span class='ocr_line'");
  };

  private static isHocrElementAWord = (hocrElement: string): boolean => {
    return hocrElement.trim().startsWith("<span class='ocrx_word'");
  };

  private static getTextInHocrWordElement = (hocrWordElement: string, pageMetaData: { pageNumber: number; pageDimension: IPageDimension }): IText => {
    const rawContent = decode(hocrWordElement.match(/>(.*)<\/span>/)[1]);
    const cleanContent = TextCleanerService.cleanRawText(rawContent);
    const startBox = this.getStartBoxInHocrElement(hocrWordElement, pageMetaData);
    return { ...startBox, cleanContent, rawContent };
  };

  private static getHocrPageDimension = (hocrFirstElement: string): IPageDimension => {
    const [, , , w, h] = hocrFirstElement.match(/bbox (\d+) (\d+) (\d+) (\d+);/);
    return { width: +w, height: +h };
  };

  private static getStartBoxInHocrElement = (
    hocrElement: string,
    { pageNumber, pageDimension }: { pageNumber: number; pageDimension: IPageDimension },
  ): IPosition => {
    const [, x, y] = hocrElement.match(/title=.bbox ([0-9]*) ([0-9]*) ([0-9]*) ([0-9]*);/);
    const { width, height } = pageDimension;
    return { xPositionProportion: +x / width, yPositionProportion: +y / height, pageNumber };
  };

  private static getEndBoxInHocrElement = (
    hocrElement: string,
    { pageNumber, pageDimension }: { pageNumber: number; pageDimension: IPageDimension },
  ): IPosition => {
    const [, x, y, w, h] = hocrElement.match(/title=.bbox ([0-9]*) ([0-9]*) ([0-9]*) ([0-9]*);/);
    const { width, height } = pageDimension;
    return { xPositionProportion: (+x + (+w - +x)) / width, yPositionProportion: (+y + (+h - +y)) / height, pageNumber };
  };
}
