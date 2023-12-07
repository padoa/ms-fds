import * as fs from 'fs/promises';

import { Controller, HttpMethod, markAuthMiddlewareAsSet, middlewares, response, route } from '@padoa/swagger';
import type { Request, Response } from 'express';
import { createConfiguredMulter } from '@padoa/express';

import { fdsEngineResponse } from '@topics/engine/fds-engine.validator.js';
import { FdsEngineService } from '@topics/engine/fds-engine.service.js';

class FdsEngineController extends Controller {
  /* c8 ignore start */
  // Ignored because this controller route will be deleted in the future
  @middlewares({ beforeValidationMiddlewares: [createConfiguredMulter().single('file')] })
  @response(200, 'Résultat du moteur de fds', fdsEngineResponse)
  @markAuthMiddlewareAsSet()
  @route('/run', HttpMethod.POST, 'Retourne le résultat du moteur de fds')
  public async runFdsEngine(req: Request, res: Response): Promise<void> {
    const temporaryFile = '/tmp/file.pdf';
    await fs.writeFile(temporaryFile, req.file.buffer);
    const { dataExtracted: data, fromImage } = await FdsEngineService.extractDataFromFds(temporaryFile);
    res.json({ data, fromImage });
  }
  /* c8 ignore stop */
}

export const fdsEngineController = new FdsEngineController('/api/fds-engine', 'fds', 'Routes pour lancer le moteur de fds');
