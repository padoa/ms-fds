import { decode } from 'html-entities';
import { createWorker } from 'tesseract.js';
import { fromPath } from 'pdf2pic';
import { promiseMapSeries } from '@padoa/promise';
import _ from 'lodash';

import type { ILine, IText } from '@src/tasks/poc/pdf_extracter/build_tree.js';

const options = {
  density: 300,
  saveFilename: 'pdf',
  savePath: './images',
  format: 'png',
  // width: 1654,
  // height: 2339,
  width: 1050,
  height: 1485,
};

const FDS_FOLDER = `/Users/padoa/meta-haw/packages/ms-fds/resources/pdf/apst18`;
const NUMBER_OF_PAGES = 3;

const FILENAME = '2549_fds_2017_argon.pdf';

export const getTextFromImagePdf = async (
  fdsFilePath: string = `${FDS_FOLDER}/${FILENAME}`,
  { numberOfPagesToParse = NUMBER_OF_PAGES }: { numberOfPagesToParse?: number } = {},
): Promise<ILine[]> => {
  // Starts the time
  await pdfToImage(fdsFilePath);

  const worker = await createWorker('fra');
  const texts = await promiseMapSeries(_.range(0, numberOfPagesToParse), async (pageNumber) => {
    return getTextFromImage(worker, pageNumber);
  });
  await worker.terminate();

  const text = _.flatMap(texts);
  return text;
};

const pdfToImage = async (pathToFile: string): Promise<void> => {
  await fromPath(pathToFile, options)
    .bulk(-1, { responseType: 'image' })
    .then((resolve) => {
      return resolve;
    });
};

const getTextFromImage = async (worker: Tesseract.Worker, pageNumber: number): Promise<ILine[]> => {
  const ret = await worker.recognize(`/Users/padoa/meta-haw/packages/ms-fds/images/pdf.${pageNumber + 1}.png`);
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

// const isHocrElementEndingALine = (hocrElement: string): boolean => {
//   return hocrElement.trim() === '</span>';
// };

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
  return { x, y };
};
