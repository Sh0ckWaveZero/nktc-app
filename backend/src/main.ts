import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import configuration from './config/configuration';

import { setupValidation } from './config/validation.config';
import { setupCors } from './config/cors.config';
import { setupMiddlewares } from './config/middlewares.config';
import { setupSecurity } from './config/security.config';
import { setupSwagger } from './config/swagger.config';
import { setupHotReload } from './config/hot-reload.config';

/**
 * เริ่มต้นและตั้งค่าแอปพลิเคชัน NestJS
 */
const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);
  const config = configuration();

  setupValidation(app);
  setupCors(app);
  setupMiddlewares(app);
  setupSecurity(app);
  setupSwagger(app);

  await app.listen(config.port);
  setupHotReload(app);
};

bootstrap();
