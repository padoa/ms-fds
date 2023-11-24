import * as fs from 'fs/promises';

import { Controller, HttpMethod, joiObject, markAuthMiddlewareAsSet, middlewares, response, route } from '@padoa/swagger';
import type { Request, Response } from 'express';
import { createConfiguredMulter } from '@padoa/express';

import Joi from '@helpers/joi.js';
import { FDSEngineService } from '@topics/engine/fds-engine.service.js';

class FDSEngineController extends Controller {
  @middlewares({ beforeValidationMiddlewares: [createConfiguredMulter().single('file')] })
  @response(200, 'Résultat du moteur de fds', joiObject({ data: Joi.any().required() }))
  @markAuthMiddlewareAsSet()
  @route('/run', HttpMethod.POST, 'Retourne le résultat du moteur de fds')
  public async runFDSEngine(req: Request, res: Response): Promise<void> {
    const temporaryFile = '/tmp/file.pdf';
    await fs.writeFile(temporaryFile, req.file.buffer);
    const { dataExtracted: data } = await FDSEngineService.extractDataFromFDS(temporaryFile);
    res.json({ data });
  }
}

export const fdsEngineController = new FDSEngineController('/api/fds-engine', 'fds', 'Routes pour lancer le moteur de fds');
