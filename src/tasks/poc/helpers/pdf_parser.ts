import * as fs from 'fs/promises';

import PDFParser from 'pdf2json';
import { promiseMap, promiseMapSeries } from '@padoa/promise';
import _ from 'lodash';

// const CLIENT = 'cmie';
const CLIENT = 'apst18';
// const CLIENT = 'polesantetravail';

// const FDS_FOLDER = `/Users/etienneturc/meta-haw/packages/ms-fds/resources/pdf/${CLIENT}`;

const FDS_FOLDER = `/Users/etienneturc/meta-haw/packages/ms-fds/resources/pdf/tesseract/hempathane`;

export const computeProportionPdfParsable = async (): Promise<void> => {
  const files = await getFilesInDirectory(FDS_FOLDER);

  // const pdfParsables = await promiseMapSeries(_.slice(files, files.length - 30, files.length), async (file) => {
  const pdfParsables = await promiseMapSeries(files, async (file) => {
    const parsable = await isPdfParsable(file);
    return parsable;
  });

  const nbParsable = _.sum(pdfParsables);
  console.log(`Proportion ${nbParsable}/${files.length}  => ${nbParsable / files.length}`);
};

export const isPdfParsable = async (filename: string): Promise<boolean> => {
  try {
    console.log(`Trying to parse ${filename}`);
    const pdf = await parsePdfWithPdfParser(`${FDS_FOLDER}/${filename}`);
    console.log(pdf);
    return !!pdf?.length;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const parsePdfWithPdfParser = async (fdsFilePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      const pdfContent: string = pdfData.Pages.map(({ Texts }) => Texts)
        .flat()
        .map((obj) => {
          return obj.R;
        })
        .flat()
        .map((obj) => {
          console.log(obj);
          return decodeURIComponent(obj.T);
        })
        .join('\n');
      resolve(pdfContent);
    });
    pdfParser.on('pdfParser_dataError', (errData) => reject(errData));
    return pdfParser.loadPDF(fdsFilePath);
  });
};
