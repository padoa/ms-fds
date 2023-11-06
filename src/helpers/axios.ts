/* c8 ignore start */
import { instantiateAxios, AxiosLogLevel } from '@padoa/axios';
import { requestIdName } from '@padoa/meta';

import logger from '@src/helpers/logger.js';
import { asyncLocalStorage } from '@src/helpers/async-local-storage.js';

const axios = instantiateAxios(logger, {
  asyncLocalStorages: [asyncLocalStorage],
  requestIdName,
  logLevel: AxiosLogLevel.INFO,
});

export default axios;
/* c8 ignore stop */
