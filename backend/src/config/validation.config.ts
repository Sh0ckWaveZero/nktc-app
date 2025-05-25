import { INestApplication, ValidationPipe } from '@nestjs/common';

/**
 * ตั้งค่า validation pipes สำหรับแอปพลิเคชัน
 * @param app - อินสแตนซ์ของ NestJS application
 */
export const setupValidation = (app: INestApplication): void => {
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true 
  }));
};
