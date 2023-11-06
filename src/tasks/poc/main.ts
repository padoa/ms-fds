/* c8 ignore start */

import { promiseMapSeriesNoResult, sleep } from '@padoa/promise';

// import { computeProportionPdfParsable, evaluatePdf, isPdfParsable } from './evaluate_pdf';

import { extractDataFromAllFDS, extractDataFromFDS } from '@src/tasks/poc/pdf_extracter/extract_fds_data.js';
import { downloadFDS, fetchFDS, readCsv } from '@src/tasks/poc/fetch_fds.js';
import { getTextFromImagePdf } from '@src/tasks/poc/pdf_extracter/pdf_image.js';

const logger = console;

const main = async (): Promise<void> => {
  // await computeProportionPdfParsable();
  // await fetchFDS();
  // await isPdfParsable('out.pdf');

  const data = await extractDataFromFDS();
  console.log(data);

  // await extractDataFromAllFDS();

  // await getTextFromImagePdf();
};

main()
  .then(() => {})
  .catch((err) => {
    logger.error('❌ ❌ ❌ ❌ ❌ ❌');
    logger.error(err);
  });
/* c8 ignore stop */
