import helmet from 'helmet';
import { INestApplication } from '@nestjs/common';
import { APP_CONSTANTS } from './app.constants';

/**
 * ตั้งค่าความปลอดภัยด้วย Helmet middleware
 * @param app - อินสแตนซ์ของ NestJS application
 */
export const setupSecurity = (app: INestApplication): void => {
  app.use(helmet());
  app.use(helmet.crossOriginResourcePolicy({ 
    policy: APP_CONSTANTS.CORS_POLICY 
  }));
};
