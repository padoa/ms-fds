import { joiObject } from '@padoa/swagger';

import Joi from '@helpers/joi.js';

export const fdsEngineRunResponse = joiObject({
  data: Joi.any().required(), // TODO: add validation schema for data
  fromImage: Joi.boolean().required(),
});
