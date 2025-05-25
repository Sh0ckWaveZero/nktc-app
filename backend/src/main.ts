import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import configuration from './config/configuration';

// Configuration modules for modular setup
import { setupValidation } from './config/validation.config';
import { setupCors } from './config/cors.config';
import { setupMiddlewares } from './config/middlewares.config';
import { setupSecurity } from './config/security.config';
import { setupSwagger } from './config/swagger.config';
import { setupHotReload } from './config/hot-reload.config';
import { SecurityMiddleware } from './middlewares/security.middleware';

/**
 * เริ่มต้นและตั้งค่าแอปพลิเคชัน NestJS พร้อมความปลอดภัยขั้นสูง
 * 
 * @description ฟังก์ชันหลักสำหรับ bootstrap แอปพลิเคชัน โดยจะตั้งค่า:
 * - Security headers และการป้องกัน
 * - Input validation ที่เข้มงวด
 * - CORS configuration ที่ปลอดภัย
 * - Middlewares สำหรับการตรวจสอบ
 * - Swagger documentation (development only)
 * - Graceful shutdown handling
 * 
 * @returns {Promise<void>} Promise ที่ resolve เมื่อแอปพลิเคชันเริ่มทำงานสำเร็จ
 * 
 * @example
 * ```typescript
 * // Start the application
 * bootstrap();
 * ```
 */
const bootstrap = async (): Promise<void> => {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const config = configuration();

  setupSecurity(app);
  setupValidation(app);
  setupCors(app);
  setupMiddlewares(app);
  
  app.use(new SecurityMiddleware().use.bind(new SecurityMiddleware()));
  
  setupSwagger(app);
  app.enableShutdownHooks();

  await app.listen(config.port);
  
  logger.log(`🚀 Application is running on port ${config.port}`);
  logger.log(`🔒 Security features are enabled for environment: ${config.node_env}`);
  
  setupHotReload(app);
};

bootstrap();
