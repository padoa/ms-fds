/* c8 ignore start */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { FDSEngineService } from '@topics/engine/fds-engine.service.js';

const logger = console;

const main = async (): Promise<void> => {
  const { filename } = await yargs(hideBin(process.argv))
    .option({
      filename: {
        demandOption: true,
        description: 'Path to the fds file from which to extract data',
        type: 'string',
      },
    })
    .parseAsync();

  logger.info(`🔵  Extracting data from ${filename}...`);
  const data = await FDSEngineService.extractDataFromFDS(filename);
  logger.info(`✅  Data extracted:`, { ...data.dataExtracted, fromImage: data.fromImage });
};

main()
  .then(() => {})
  .catch((err) => {
    logger.error('❌ ❌ ❌ ❌ ❌ ❌');
    logger.error(err);
  });
/* c8 ignore stop */
