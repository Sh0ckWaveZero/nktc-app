import { ValidationPipe } from '@nestjs/common';
import { GlobalErrorFilter } from '@common/filters/global-error.filter';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor';

/**
 * Setup global filters and interceptors for the application
 */
export const setupFilters = (app: any, configService: any): void => {
  // Global error filter
  app.useGlobalFilters(new GlobalErrorFilter(configService));

  // Global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());
};

/**
 * Setup validation pipe with comprehensive error handling
 */
export const setupValidationPipe = (): ValidationPipe => {
  return new ValidationPipe({
    whitelist: true, // Strip properties that don't have any decorators
    forbidNonWhitelisted: true, // Throw an error if non-whitelisted values are provided
    transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
    transformOptions: {
      enableImplicitConversion: true, // Allow automatic conversion of primitive types
    },
    exceptionFactory: (errors) => {
      const errorMessages = errors.map((error) => ({
        field: error.property,
        message: Object.values(error.constraints).join(', '),
      }));

      return {
        statusCode: 400,
        message: 'Validation failed',
        errors: errorMessages,
      };
    },
  });
};
