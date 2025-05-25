import { INestApplication } from '@nestjs/common';
import configuration from './configuration';
import { APP_CONSTANTS } from './app.constants';
import { CorsConfig } from './app.types';

/**
 * ตั้งค่า CORS สำหรับแอปพลิเคชัน
 * @param app - อินสแตนซ์ของ NestJS application
 */
export const setupCors = (app: INestApplication): void => {
  const config = configuration();
  const corsConfig: CorsConfig = {
    origin: config.node_env === 'development' 
      ? APP_CONSTANTS.DEVELOPMENT_ORIGIN 
      : config.host.toString(),
    allowedHeaders: APP_CONSTANTS.CORS_ALLOWED_HEADERS,
    methods: APP_CONSTANTS.CORS_ALLOWED_METHODS,
    credentials: true,
  };
  
  app.enableCors(corsConfig);
};
