import { SwaggerGenerator } from '@padoa/swagger';

const swaggerGenerator = SwaggerGenerator.getInstance();

swaggerGenerator.setApiInfos('FDS', 'MS FDS', process.env.npm_package_version);

export default swaggerGenerator;