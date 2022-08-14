declare const module: any;

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import configuration from './config/configuration';


const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  // Enable OpenAPI documentation for the application 
  if (configuration().node_env === 'development') {
    const config = new DocumentBuilder()
      .setTitle('NKTC-API')
      .setDescription('The NKTC API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }
  app.enableCors();
  app.use(helmet());
  await app.listen(configuration().port);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
