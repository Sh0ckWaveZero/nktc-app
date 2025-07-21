import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import configuration from './configuration';
import { APP_CONSTANTS } from './app.constants';
import { SwaggerConfig } from './app.types';

/**
 * สร้าง Swagger configuration object
 * @returns การตั้งค่า Swagger
 */
const createSwaggerConfig = (): SwaggerConfig => ({
  title: APP_CONSTANTS.API_TITLE,
  description: APP_CONSTANTS.API_DESCRIPTION,
  version: APP_CONSTANTS.API_VERSION,
  bearerAuth: true,
});

/**
 * สร้าง DocumentBuilder configuration สำหรับ Swagger
 * @param swaggerConfig - การตั้งค่า Swagger
 * @returns DocumentBuilder ที่ตั้งค่าแล้ว
 */
const createDocumentBuilder = (swaggerConfig: SwaggerConfig) => {
  return new DocumentBuilder()
    .setTitle(swaggerConfig.title)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .addBearerAuth()
    .build();
};

/**
 * ตั้งค่า Swagger documentation สำหรับ development environment
 * @param app - อินสแตนซ์ของ NestJS application
 */
export const setupSwagger = (app: INestApplication): void => {
  const config = configuration();

  if (config.node_env !== 'development') {
    return;
  }

  const swaggerConfig = createSwaggerConfig();
  const documentConfig = createDocumentBuilder(swaggerConfig);

  const document = SwaggerModule.createDocument(app, documentConfig, {
    ignoreGlobalPrefix: true,
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup(APP_CONSTANTS.SWAGGER_PATH, app, document);
};
