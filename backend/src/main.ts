declare const module: any;

import * as bodyParser from 'body-parser';
import * as requestIp from 'request-ip';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import configuration from './config/configuration';
import helmet from 'helmet';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  // Request Validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: configuration().node_env === 'development' ? '*' : configuration().host.toString(),
    allowedHeaders: 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe, authorization',
    methods: 'GET,PUT,POST,PATCH,DELETE,UPDATE,OPTIONS',
    credentials: true,
  });

  app.use(requestIp.mw());
  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

  // Helmet Middleware against known security vulnerabilities
  app.use(helmet());
  app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

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
  await app.listen(configuration().port);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
};

bootstrap();
