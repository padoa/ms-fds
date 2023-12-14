import { joiObject } from '@padoa/swagger';

import Joi from '@helpers/joi.js';

export const pdftronInfoResponse = joiObject({
  cil: Joi.string().required(),
  pil: Joi.string().required(),
  til: Joi.string().required(),
});
