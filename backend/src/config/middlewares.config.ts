import * as bodyParser from 'body-parser';
import * as requestIp from 'request-ip';
import { INestApplication } from '@nestjs/common';
import { APP_CONSTANTS } from './app.constants';

/**
 * ตั้งค่า middleware ต่างๆ สำหรับแอปพลิเคชัน
 * @param app - อินสแตนซ์ของ NestJS application
 */
export const setupMiddlewares = (app: INestApplication): void => {
  app.use(requestIp.mw());
  app.use(bodyParser.json({ limit: APP_CONSTANTS.BODY_LIMIT }));
  app.use(bodyParser.urlencoded({ 
    limit: APP_CONSTANTS.BODY_LIMIT, 
    extended: true 
  }));
};
