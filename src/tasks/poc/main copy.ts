/* c8 ignore start */
import * as fs from 'fs/promises';
import { execSync } from 'child_process';
import _ from '@padoa/lodash';
import { promiseMap, promiseMapSeriesNoResult } from '@padoa/promise';
import { glob } from 'glob';
import PDFParser from 'pdf2json';
import OpenAI from 'openai';
import { cleanUnusedImports } from 'tools/route_to_swagger/clean_imports';

const util = require('util');

const logger = console;

const fsdFileName = 'FDS - Encres HP numérique - CP833séries - Copie.pdf';
const fdsFolder = '/Users/etienneturc/risque-chimique/FDS';
const fdsFilePath = `${fdsFolder}/${fsdFileName}`;

const openai = new OpenAI({
  apiKey: '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',
});

const main = async (): Promise<void> => {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Say this is a test' }],
    model: 'gpt-3.5-turbo',
  });

  console.log(chatCompletion.choices);

  // const file = await fs.readFile(fdsFilePath);
  // const text = pdfParser.parseBuffer(file);
  // console.log(text);

  // console.log(file.toString('base64'));

  // const data = await parsePdf();

  // pdfExtract(fdsFilePath, {}, function (err, pages) {
  //   if (err) {
  //     console.log(err);
  //     return;
  //   }
  //   console.log('extracted pages', pages);
  // });
};

const parsePdf = async () => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      console.log(JSON.stringify(pdfData.Pages.map((page) => page.Texts)));
      resolve(pdfData);
    });
    pdfParser.on('pdfParser_dataError', (errData) => reject(errData));
    pdfParser.loadPDF(fdsFilePath);
  });
};

main()
  .then(() => {
    // eslint-disable-next-line no-process-exit
    process.exit(0);
  })
  .catch((err) => {
    logger.error('❌ ❌ ❌ ❌ ❌ ❌');
    logger.error(err);
  });
/* c8 ignore stop */
