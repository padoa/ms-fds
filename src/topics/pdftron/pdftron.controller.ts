import config from 'config';
import { Controller, HttpMethod, markAuthMiddlewareAsSet, response, route } from '@padoa/swagger';
import type { Request, Response } from 'express';

import { pdftronInfoResponse } from '@topics/pdftron/pdftron.validator.js';

export class PdftronController extends Controller {
  /* c8 ignore start */
  // Ignored because this controller route will be deleted in the future
  @response(200, 'Les informations PDFTron', pdftronInfoResponse)
  @markAuthMiddlewareAsSet()
  @route('/info', HttpMethod.GET, 'Retourne les informations PDFTron')
  public async get(req: Request, res: Response): Promise<void> {
    res.json({
      // cil not named license to obfuscate
      cil: btoa(config.get<string>('pdftron.licenseKey')),
      // false attributes to obfuscate the license
      pil: btoa('POLI'.repeat(32)),
      til: btoa('PAPI'.repeat(32)),
    });
  }
  /* c8 ignore stop */
}

export const pdftronController = new PdftronController('/api/pdftron', 'pdftron', 'Routes pour récupérer les informations PDFTron');
