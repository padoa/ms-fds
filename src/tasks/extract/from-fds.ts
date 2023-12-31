/* c8 ignore start */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import _ from 'lodash';

import { FdsEngineService } from '@topics/engine/fds-engine.service.js';

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
  const data = await FdsEngineService.extractDataFromFds(filename);
  logger.info(`✅  Data extracted:`, {
    date: data.dataExtracted?.date,
    product: data.dataExtracted?.product?.name,
    producer: data.dataExtracted?.producer?.name,
    warningNotice: data.dataExtracted?.warningNotice?.value,
    dangers: _.map(data.dataExtracted?.dangers, 'code'),
    substances: !_.isEmpty(data.dataExtracted?.substances)
      ? _.map(data.dataExtracted?.substances, (substance) => ({
          casNumber: substance.casNumber?.value,
          ceNumber: substance.ceNumber?.value,
          concentration: substance.concentration?.value,
          hazards: JSON.stringify(_.map(substance.hazards, 'code')),
        }))
      : null,
    physicalState: data.dataExtracted?.physicalState?.value,
    vaporPressure: _.pick(data.dataExtracted?.vaporPressure, ['pressure', 'temperature']),
    boilingPoint: data.dataExtracted?.boilingPoint?.value,
    fromImage: data.fromImage,
  });
};

main()
  .then(() => {})
  .catch((err) => {
    logger.error('❌ ❌ ❌ ❌ ❌ ❌');
    logger.error(err);
  });
/* c8 ignore stop */
