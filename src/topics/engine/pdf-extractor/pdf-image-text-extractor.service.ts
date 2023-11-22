import { decode } from 'html-entities';
import { createWorker } from 'tesseract.js';
import { fromPath } from 'pdf2pic';
import { promiseMapSeries } from '@padoa/promise';
import _ from 'lodash';
import type { Options } from 'pdf2pic/dist/types/options.js';

import type { IBox, ILine, IText } from '@topics/engine/model/fds.model.js';

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

// TODO: PdfImageTextExtractorService class

export const getTextFromImagePdf = async (
  fdsFilePath: string,
  { numberOfPagesToParse }: { numberOfPagesToParse?: number } = {},
): Promise<ILine[]> => {
  await pdfToImage(fdsFilePath, { numberOfPagesToParse });

  const worker = await createWorker('fra');
  const texts = await promiseMapSeries(_.range(0, numberOfPagesToParse), async (pageNumber) => {
    return getTextFromImage(worker, pageNumber);
  });
  await worker.terminate();

  const text = _.flatMap(texts);
  return text;
};

const pdfToImage = async (pathToFile: string, { numberOfPagesToParse }: { numberOfPagesToParse: number }): Promise<void> => {
  // TODO: clean temporary images folder
  await fromPath(pathToFile, options)
    .bulk(_.range(1, numberOfPagesToParse + 2), { responseType: 'image' })
    .then((resolve) => {
      return resolve;
    });
};

const getTextFromImage = async (worker: Tesseract.Worker, pageNumber: number): Promise<ILine[]> => {
  const imagePath = `${tempImageFolderName}/${tempImageFileName}.${pageNumber + 1}.${tempImageFormat}`;
  const ret = await worker.recognize(imagePath);
  return hocrToLines(ret.data.hocr);
};

const hocrToLines = (hocr: string): ILine[] => {
  const hocrByLine = hocr.split('\n');
  return _.reduce(
    hocrByLine,
    (lines, hocrElement) => {
      if (isHocrElementAWord(hocrElement)) {
        const text = getTextInHocrWordElement(hocrElement);
        const lastLine = _.last(lines);
        lastLine.texts.push(text);
        return lines;
      }

      if (isHocrElementALine(hocrElement)) {
        const box = getBoxInHocrElement(hocrElement);
        lines.push({ ...box, texts: [] } as ILine);
        return lines;
      }

      return lines;
    },
    [] as ILine[],
  );
};

const isHocrElementALine = (hocrElement: string): boolean => {
  return hocrElement.trim().startsWith("<span class='ocr_line'");
};

const isHocrElementAWord = (hocrElement: string): boolean => {
  return hocrElement.trim().startsWith("<span class='ocrx_word'");
};

const getTextInHocrWordElement = (hocrWordElement: string): IText => {
  const content = decode(hocrWordElement.match(/>(.*)<\/span>/)[1].toLowerCase());
  const box = getBoxInHocrElement(hocrWordElement);
  return { ...box, content };
};

const getBoxInHocrElement = (hocrElement: string): IBox => {
  const [, x, y] = hocrElement.match(/title=.bbox ([0-9]*) ([0-9]*) ([0-9]*) ([0-9]*);/);
  return { x: +x, y: +y };
};
