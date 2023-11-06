import { existsSync, mkdirSync } from 'fs';

import swaggerGenerator from '@helpers/swagger-generator.js';
import { app } from '@src/app.js'; // Needed to populate Swagger Generator correctly
// eslint-disable-next-line no-console
console.log(app.name); // Required so Typescript import the application
const dir = 'generated';
const fileName = `swagger.json`;
if (!existsSync(dir)) {
  mkdirSync(dir);
}
// eslint-disable-next-line no-console
swaggerGenerator.writeSwaggerToFile(`./${dir}/${fileName}`);
