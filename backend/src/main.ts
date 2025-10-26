import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import configuration from './config/configuration';

// Configuration modules for modular setup
import { setupValidation } from './config/validation.config';
import { setupCors } from './config/cors.config';
import { setupMiddlewares } from './config/middlewares.config';
import { setupSecurity } from './config/security.config';
import { setupSwagger } from './config/swagger.config';
import { setupHotReload } from './config/hot-reload.config';
import { SecurityMiddleware } from './middlewares/security.middleware';

// New improvements
import { GlobalErrorFilter } from '@common/filters/global-error.filter';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { RequestLoggerMiddleware } from '@common/middleware/request-logger.middleware';

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
    logger: ['error', 'warn', 'log', 'debug'],
  });
  const config = configuration();
  const configService = app.get(ConfigService);

  // Setup core configurations
  setupSecurity(app);
  setupValidation(app);
  setupCors(app);
  setupMiddlewares(app);

  // Apply security middleware
  app.use(new SecurityMiddleware().use.bind(new SecurityMiddleware()));

  // Setup enhanced error handling and logging
  app.useGlobalFilters(new GlobalErrorFilter(configService));
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Apply request logger middleware with proper binding
  const requestLogger = new RequestLoggerMiddleware();
  app.use(requestLogger.use.bind(requestLogger));

  // Setup API prefix
  app.setGlobalPrefix('api');

  setupSwagger(app);
  app.enableShutdownHooks();

  // Graceful shutdown handlers
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM signal received: closing HTTP connections');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT signal received: closing HTTP connections');
    await app.close();
    process.exit(0);
  });

  await app.listen(config.port, '0.0.0.0');

  logger.log(`🚀 Application is running on http://localhost:${config.port}`);
  logger.log(`📚 API Documentation: http://localhost:${config.port}/api-docs`);
  logger.log(`🌍 Environment: ${config.node_env}`);
  logger.log(
    `🔒 Security features are enabled for environment: ${config.node_env}`,
  );

  setupHotReload(app);
};

bootstrap();
