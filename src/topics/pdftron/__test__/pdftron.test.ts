import request from 'supertest';
import { describe, expect, it } from 'vitest';
import config from 'config';

import { app } from '@src/app.js';

describe('# PDFTron Infos', () => {
  it('Should return status 200 and the PDFTron license key in the PDFTron information route', async () => {
    const expectedCil = btoa(config.get<string>('pdftron.licenseKey'));
    const res = await request(app).get('/api/ms-fds/pdftron/info');
    expect(res.status).toBe(200);
    expect(res.body.cil).toEqual(expectedCil);
  });
});
