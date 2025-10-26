import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: {
    timestamp: string;
    path: string;
    method: string;
    duration?: number;
    pagination?: {
      page?: number;
      limit?: number;
      total?: number;
      totalPages?: number;
    };
  };
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const startTime = Date.now();

    return next.handle().pipe(
      map((data) => {
        const duration = Date.now() - startTime;

        // Handle different response formats
        if (data && typeof data === 'object') {
          // Check if it's already a formatted response
          if ('success' in data || 'statusCode' in data) {
            return {
              ...data,
              meta: {
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
                duration,
                ...data.meta,
              },
            };
          }

          // Check if it's a paginated response
          if ('data' in data && ('meta' in data || 'pagination' in data)) {
            return {
              success: true,
              statusCode: 200,
              message: 'Request successful',
              data: data.data,
              meta: {
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
                duration,
                pagination: data.pagination || data.meta,
              },
            };
          }

          // Direct data response
          return {
            success: true,
            statusCode: 200,
            message: 'Request successful',
            data,
            meta: {
              timestamp: new Date().toISOString(),
              path: request.url,
              method: request.method,
              duration,
            },
          };
        }

        // Simple response for non-object data
        return {
          success: true,
          statusCode: 200,
          message: 'Request successful',
          data,
          meta: {
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            duration,
          },
        };
      }),
    );
  }
}
