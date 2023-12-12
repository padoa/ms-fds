/* c8 ignore start */

import * as fs from 'fs/promises';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { promiseMapSeries } from '@padoa/promise';

import type { IExtractedData } from '@topics/engine/model/fds.model.js';
import { FdsEngineService } from '@topics/engine/fds-engine.service.js';

const logger = console;

const main = async (): Promise<void> => {
  const { folder, csvFile } = await yargs(hideBin(process.argv))
    .option({
      folder: {
        demandOption: true,
        description: 'Folder containing fds to extract data from',
        type: 'string',
      },
      csvFile: {
        demandOption: true,
        description: 'Csv file in which the results are stored',
        type: 'string',
      },
    })
    .parseAsync();

  logger.info(`🔵  Fetching files in ${folder}...`);
  const files = await getFilesInDirectory(folder);

  logger.info(`🔵  Add columns to csv ${csvFile}...`);
  await addColumnsToCsv(csvFile);

  logger.info(`🔵  Extracting data from ${folder}...`);
  await promiseMapSeries(files, async (file) => {
    logger.info(`🔵  Extracting data from ${file}...`);
    const data = await FdsEngineService.extractDataFromFds(`${folder}/${file}`);
    await saveInCsv(csvFile, file, data);
  });

  logger.info(`✅  Toutes les données ont été correctement extraite`);
};

const getFilesInDirectory = async (folder: string): Promise<string[]> => {
  const elementsInFolder = await fs.readdir(folder);
  return elementsInFolder.filter((file) => !file.includes('.DS_Store'));
};

const addColumnsToCsv = async (csvFile: string): Promise<void> => {
  const headers = [
    'Nom du PDF',
    'Date',
    'Date affichée',
    'Nom du produit',
    'Nom du fournisseur',
    'Dangers',
    'Substances',
    'État physique',
    'Pression de vapeur',
    'Image ?',
  ].join(';');
  return fs.writeFile(csvFile, `${headers}\n`);
};

const saveInCsv = async (
  csvFile: string,
  fileName: string,
  {
    dataExtracted: {
      date: { formattedDate, inTextDate },
      product,
      producer,
      dangers,
      substances,
      physicalState,
      vaporPressure,
    },
    fromImage,
  }: {
    dataExtracted: IExtractedData;
    fromImage: boolean;
  },
): Promise<void> => {
  const resultLine = [
    fileName,
    formattedDate,
    inTextDate,
    product?.name,
    producer?.name,
    dangers.map((danger) => danger.code).join(','),
    substances.map((substance) => `cas: ${substance.casNumber}, ce: ${substance.ceNumber}`).join(','),
    physicalState?.value,
    `${vaporPressure?.pressure} ${vaporPressure?.temperature}`,
    fromImage,
    // /!\ If you add a line here please add it in the header above as well /!\
  ].join(';');

  return fs.appendFile(csvFile, `${resultLine}\n`);
};

main()
  .then(() => {})
  .catch((err) => {
    logger.error('❌ ❌ ❌ ❌ ❌ ❌');
    logger.error(err);
  });
/* c8 ignore stop */
