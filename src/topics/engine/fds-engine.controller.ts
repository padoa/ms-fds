import * as fs from 'fs/promises';

import { Controller, HttpMethod, body, joiObject, markAuthMiddlewareAsSet, middlewares, response, route } from '@padoa/swagger';
import type { Request, Response } from 'express';
import { createConfiguredMulter } from '@padoa/express';

import { fdsEngineRunResponse, fdsEngineSaveSectionBody } from '@topics/engine/fds-engine.validator.js';
import { FdsEngineService } from '@topics/engine/fds-engine.service.js';
import Joi from '@helpers/joi.js';

class FdsEngineController extends Controller {
  /* c8 ignore start */
  // Ignored because this controller route will be deleted in the future
  @middlewares({ beforeValidationMiddlewares: [createConfiguredMulter().single('file')] })
  @response(200, 'Résultat du moteur de fds', fdsEngineRunResponse)
  @markAuthMiddlewareAsSet()
  @route('/run', HttpMethod.POST, 'Retourne le résultat du moteur de fds')
  public async runFdsEngine(req: Request, res: Response): Promise<void> {
    const temporaryFile = '/tmp/file.pdf';
    await fs.writeFile(temporaryFile, req.file.buffer);
    const { dataExtracted: data, fromImage } = await FdsEngineService.extractDataFromFds(temporaryFile);
    res.json({ data, fromImage });
  }
  /* c8 ignore stop */

  /* c8 ignore start */
  // Ignored because this controller route will be deleted in the future
  @response(200, 'Résultats sauvegardés', joiObject({ status: Joi.valid('OK') }))
  @markAuthMiddlewareAsSet()
  @body(fdsEngineSaveSectionBody)
  @route('/save-section', HttpMethod.POST, 'Sauvegarde dans un fichier json les données envoyées')
  public async saveFdsSectionData(req: Request, res: Response): Promise<void> {
    const jsonToStoreData = 'resources/annotated-dataset.json';
    await fs.appendFile(jsonToStoreData, `${JSON.stringify(req.body)}\n`);
    res.json({ status: 'OK' });
  }
  /* c8 ignore stop */
}

export const fdsEngineController = new FdsEngineController('/api/fds/fds-engine', 'fds', 'Routes pour lancer le moteur de fds');
