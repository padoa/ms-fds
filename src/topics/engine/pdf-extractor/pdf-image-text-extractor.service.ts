import { decode } from 'html-entities';
import { createWorker } from 'tesseract.js';
import { fromPath } from 'pdf2pic';
import { promiseMapSeries } from '@padoa/promise';
import _ from 'lodash';
import type { Options } from 'pdf2pic/dist/types/options.js';

import type { IBox, ILine, IPageDimension, IText } from '@topics/engine/model/fds.model.js';
import type { IExtractorResult } from '@topics/engine/pdf-extractor/pdf-extractor.model.js';

const tempImageFileName = 'fds-image';
const tempImageFolderName = '/tmp';
const tempImageFormat = 'png';

const options: Options = {
  density: 300,
  saveFilename: tempImageFileName,
  savePath: `${tempImageFolderName}`,
  format: tempImageFormat,
  width: 1050,
  height: 1485,
};

export class PdfImageTextExtractorService {
  public static async getTextAndDimensionFromImagePdf(
    fdsFilePath: string,
    { numberOfPagesToParse }: { numberOfPagesToParse?: number } = {},
  ): Promise<IExtractorResult> {
    await this.pdfToImage(fdsFilePath, { numberOfPagesToParse });

    const worker = await createWorker('fra');
    const textsAndDimension = await promiseMapSeries(_.range(0, numberOfPagesToParse), async (index) => {
      return this.getTextAndDimensionFromImage(worker, index + 1);
    });
    await worker.terminate();

    const pageDimension = _.first(textsAndDimension)?.pageDimension || null;
    const lines = _.flatMap(textsAndDimension, (e) => e.lines);

    return { lines, pageDimension };
  }

  private static pdfToImage = async (pathToFile: string, { numberOfPagesToParse }: { numberOfPagesToParse: number }): Promise<void> => {
    // TODO: clean temporary images folder
    await fromPath(pathToFile, options)
      .bulk(_.range(1, numberOfPagesToParse + 2), { responseType: 'image' })
      .then((resolve) => {
        return resolve;
      });
  };

  private static getTextAndDimensionFromImage = async (worker: Tesseract.Worker, pageNumber: number): Promise<IExtractorResult> => {
    const imagePath = `${tempImageFolderName}/${tempImageFileName}.${pageNumber}.${tempImageFormat}`;
    const ret = await worker.recognize(imagePath);

    const hocrByLine = ret.data.hocr.split('\n');
    const pageDimension = this.getHocrPageDimension(_.first(hocrByLine));
    const lines = this.hocrToLines(hocrByLine, pageNumber);
    return { lines, pageDimension };
  };

  private static hocrToLines = (hocrByLine: string[], pageNumber: number): ILine[] => {
    return _.reduce(
      hocrByLine,
      (lines, hocrElement) => {
        if (this.isHocrElementAWord(hocrElement)) {
          const text = this.getTextInHocrWordElement(hocrElement);
          const lastLine = _.last(lines);
          lastLine.texts.push(text);
          return lines;
        }

        if (this.isHocrElementALine(hocrElement)) {
          const startBox = this.getStartBoxInHocrElement(hocrElement);
          const endBox = this.getEndBoxInHocrElement(hocrElement);
          lines.push({ startBox, endBox, pageNumber, texts: [] } as ILine);
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

  private static getTextInHocrWordElement = (hocrWordElement: string): IText => {
    const content = decode(hocrWordElement.match(/>(.*)<\/span>/)[1].toLowerCase());
    const box = this.getStartBoxInHocrElement(hocrWordElement);
    return { ...box, content };
  };

  private static getHocrPageDimension = (hocrFirstElement: string): IPageDimension => {
    const [, , , w, h] = hocrFirstElement.match(/bbox (\d+) (\d+) (\d+) (\d+);/);
    return { width: +w, height: +h };
  };

  private static getStartBoxInHocrElement = (hocrElement: string): IBox => {
    const [, x, y] = hocrElement.match(/title=.bbox ([0-9]*) ([0-9]*) ([0-9]*) ([0-9]*);/);
    return { x: +x, y: +y };
  };

  private static getEndBoxInHocrElement = (hocrElement: string): IBox => {
    const [, x, y, w, h] = hocrElement.match(/title=.bbox ([0-9]*) ([0-9]*) ([0-9]*) ([0-9]*);/);
    return { x: +x + (+w - +x), y: +y + (+h - +y) };
  };
}
