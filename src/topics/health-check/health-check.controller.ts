import { Controller, HttpMethod, joiObject, markAuthMiddlewareAsSet, parameters, response, route } from '@padoa/swagger';
import type { Request, Response } from 'express';

import Joi from '@helpers/joi.js';
import hash from '@src/hash.js';

class HealthCheckController extends Controller {
  @parameters({})
  @response(200, "Health Check de l'API", joiObject({ msg: Joi.string().required() }))
  @markAuthMiddlewareAsSet()
  @route('/', HttpMethod.GET, "Renvoie ok si l'application express est correctement lancée")
  public async healthCheck(req: Request, res: Response): Promise<void> {
    res.status(200).json({ msg: 'ok' });
  }

  @parameters({})
  @response(200, 'Hash de commit', joiObject({ hash: Joi.string().required() }))
  @markAuthMiddlewareAsSet()
  @route('/hash', HttpMethod.GET, 'Renvoie le hash de commit correspondant à la version du micro-service déployée')
  public async getHash(req: Request, res: Response): Promise<void> {
    res.send({ hash });
  }
}

export const healthCheckController = new HealthCheckController(
  '/health-check',
  'health-check',
  "Routes pour vérifier que l'application tourne correctement",
);
