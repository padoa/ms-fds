import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '@src/app.js';
import hash from '@src/hash.js';

describe.skip('# Health Check', () => {
  it('should return status 200 for health check route', async () => {
    const res = await request(app).get('/health-check');
    expect(res.status).toBe(200);
    expect(res.body.msg).toBe('ok');
  });

  it('should return correct hash through hash health check route', async () => {
    const res = await request(app).get('/health-check/hash');
    expect(res.status).toBe(200);
    expect(res.body.hash).toEqual(hash);
  });
});
