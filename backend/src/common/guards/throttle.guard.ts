import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request, Response } from 'express';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ThrottleGuard implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Skip throttling for health check or static files
    if (this.shouldSkipThrottling(request.path)) {
      return next.handle();
    }

    const limit =
      this.reflector.get<number>('throttle-limit', context.getHandler()) || 100;
    const ttl =
      this.reflector.get<number>('throttle-ttl', context.getHandler()) || 60; // seconds

    // Simple rate limiting logic (in production, use Redis)
    const clientIp = request.ip || request.connection.remoteAddress;
    const _key = `throttle:${clientIp}:${request.route?.path || request.path}`;

    // For now, just set rate limiting headers
    response.set({
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': Math.max(0, limit - 1).toString(),
      'X-RateLimit-Reset': new Date(Date.now() + ttl * 1000).toISOString(),
    });

    return next.handle();
  }

  private shouldSkipThrottling(path: string): boolean {
    const skipPaths = ['/health', '/metrics', '/favicon.ico'];
    return skipPaths.includes(path) || path.startsWith('/static/');
  }
}
