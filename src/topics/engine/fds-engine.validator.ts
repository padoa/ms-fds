import { joiObject } from '@padoa/swagger';
import { ProductValidationSection, ProductWarningNotice } from '@padoa/chemical-risk';

import Joi from '@helpers/joi.js';

export const fdsEngineRunResponse = joiObject({
  data: Joi.any().required(), // TODO: add validation schema for data
  fromImage: Joi.boolean().required(),
});

export const fdsEngineSaveSectionBody = joiObject({
  filename: Joi.string().required(),
  section: Joi.string()
    .valid(...Object.values(ProductValidationSection))
    .required(),
  data: joiObject({
    date: Joi.p_iso_date.allow(null).optional(),
    product: Joi.string().allow(null).optional(),
    producer: Joi.string().allow(null).optional(),
    warningNotice: Joi.string()
      .valid(...Object.values(ProductWarningNotice))
      .allow(null)
      .optional(),
    dangers: Joi.array().items(Joi.string()).optional(),
    substances: Joi.array()
      .items(
        joiObject({
          casNumber: Joi.string().allow(null).required(),
          ceNumber: Joi.string().allow(null).required(),
          concentration: Joi.string().allow(null).required(),
          hazards: Joi.array().items(Joi.string()).required(),
        }),
      )
      .optional(),
    physicalState: Joi.string().allow(null).optional(),
    vaporPressure: joiObject({
      pressure: Joi.string().allow(null).required(),
      temperature: Joi.string().allow(null).required(),
    }).optional(),
    boilingPoint: Joi.string().allow(null).optional(),
  }).required(),
});
