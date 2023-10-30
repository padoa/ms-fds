import express from 'express';
import { SwaggerGenerator } from '@padoa/swagger';
import config from 'config';
import { createApiErrorHandler, createConverterErrorHandler, LogRequestsMiddlewaresFactory, mainFirstMiddlewares, notFound } from '@padoa/express';

import logger from '@helpers/logger.js';
import { asyncLocalStorage } from '@helpers/async-local-storage.js';
import routes from '@src/routes.js';

SwaggerGenerator.getInstance().setApiInfos('MS Super Admin Panel', 'Backend du super admin panel (SAPE)', process.env.npm_package_version);

const app = express();

const logRequestsMiddlewaresFactory = new LogRequestsMiddlewaresFactory(logger, config.get('logger.incoming'), { strippedBodyKeys: [] });

const GLOBAL_MIDDLEWARE = [
  logRequestsMiddlewaresFactory.startTimer,
  ...mainFirstMiddlewares({
    cookieParser: true,
    cookieJwtSecret: config.get('express.cookieJwtSecret'),
    compression: false,
    methodOverride: false,
    helmet: true,
    noResponseCache: true,
    cors: false,
    bodyParser: true,
    asyncLocalStorage,
  }),
  logRequestsMiddlewaresFactory.logRequest,
];
for (const middleware of GLOBAL_MIDDLEWARE) {
  app.use(middleware);
}

app.use(routes);

app.use('/api-docs', SwaggerGenerator.getInstance().getSwaggerRouter());

const GLOBAL_HANDLERS = [notFound, createConverterErrorHandler(), logRequestsMiddlewaresFactory.logErrors, createApiErrorHandler()];
for (const handler of GLOBAL_HANDLERS) {
  app.use(handler);
}

export { app };
