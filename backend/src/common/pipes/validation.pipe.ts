import { ValidationPipe } from '@nestjs/common';

export const GlobalValidationPipe = new ValidationPipe({
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
