import { Router } from 'express';

import { healthCheckController } from '@topics/health-check/health-check.controller.js';
import { fdsEngineController } from '@topics/engine/fds_engine.controller.js';

const controllers = [healthCheckController, fdsEngineController];

const router = Router();

for (const controller of controllers) {
  router.use(controller.basePath, controller.createRouter());
}

export default router;
