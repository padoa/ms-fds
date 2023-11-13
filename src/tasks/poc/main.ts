/* c8 ignore start */

import { extractDataFromAllFDS, extractDataFromFDS } from '@src/tasks/poc/fds_extractor.js';

const logger = console;

const main = async (): Promise<void> => {
  // await extractDataFromFDS();

  await extractDataFromAllFDS();
};

main()
  .then(() => {})
  .catch((err) => {
    logger.error('❌ ❌ ❌ ❌ ❌ ❌');
    logger.error(err);
  });
/* c8 ignore stop */
