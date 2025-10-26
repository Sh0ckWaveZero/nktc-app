import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalErrorFilter.name);

  constructor(private configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | object;
    let errorCode: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
      } else {
        message = exception.message;
      }

      errorCode = this.getErrorCode(status);
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = this.getPrismaStatusCode(exception.code);
      message = this.getPrismaErrorMessage(exception);
      errorCode = `PRISMA_${exception.code}`;
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid query parameters';
      errorCode = 'PRISMA_VALIDATION_ERROR';
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      errorCode = 'INTERNAL_ERROR';
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...(this.configService.get('NODE_ENV') === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
        details: exception,
      }),
    };

    // Log error details
    this.logError(exception, request, status);

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
    };

    return errorCodes[status] || 'UNKNOWN_ERROR';
  }

  private getPrismaStatusCode(code: string): number {
    const statusCodes: Record<string, number> = {
      P2002: HttpStatus.CONFLICT, // Unique constraint violation
      P2025: HttpStatus.NOT_FOUND, // Record not found
      P2003: HttpStatus.BAD_REQUEST, // Foreign key constraint violation
      P2014: HttpStatus.BAD_REQUEST, // Relation violation
      P2021: HttpStatus.BAD_REQUEST, // Table does not exist
      P2022: HttpStatus.BAD_REQUEST, // Column does not exist
    };

    return statusCodes[code] || HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getPrismaErrorMessage(
    exception: Prisma.PrismaClientKnownRequestError,
  ): string {
    const errorMessages: Record<string, string> = {
      P2002: 'A record with this value already exists',
      P2025: 'Record not found',
      P2003: 'Invalid reference provided',
      P2014: 'A relation violation occurred',
      P2021: 'The table does not exist in the database',
      P2022: 'The column does not exist in the database',
    };

    return errorMessages[exception.code] || 'Database operation failed';
  }

  private logError(exception: unknown, request: Request, status: number): void {
    const logData = {
      statusCode: status,
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.get('user-agent'),
      body: request.body,
      query: request.query,
      params: request.params,
      timestamp: new Date().toISOString(),
    };

    if (status >= 500) {
      this.logger.error(
        `Server Error: ${
          exception instanceof Error ? exception.message : 'Unknown error'
        }`,
        {
          exception,
          request: logData,
        },
      );
    } else {
      this.logger.warn(
        `Client Error: ${
          exception instanceof Error ? exception.message : 'Unknown error'
        }`,
        {
          request: logData,
        },
      );
    }
  }
}
