import { Router } from 'express';

import { healthCheckController } from '@topics/health-check/health-check.controller.js';

const controllers = [healthCheckController];

const router = Router();

for (const controller of controllers) {
  router.use(controller.basePath, controller.createRouter());
}

export default router;
