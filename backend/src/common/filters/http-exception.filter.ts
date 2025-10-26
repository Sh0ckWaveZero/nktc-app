import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let message: string | object;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error;
        error = responseObj.error || 'Http Exception';
      } else {
        message = exceptionResponse as string;
        error = 'Http Exception';
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal Server Error';

      // Log unexpected errors
      this.logger.error(
        `Unexpected error: ${exception}`,
        (exception as Error).stack,
      );
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
      {
        ip: request.ip,
        userAgent: request.get('User-Agent'),
        timestamp: new Date().toISOString(),
      },
    );

    // Format the error response
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
      ...(process.env.NODE_ENV === 'development' && {
        stack: (exception as Error)?.stack,
      }),
    };

    response.status(status).json(errorResponse);
  }
}
