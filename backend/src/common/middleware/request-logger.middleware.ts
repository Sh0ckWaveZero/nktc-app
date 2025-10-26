import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithId extends Request {
  id: string;
  startTime: number;
}

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggerMiddleware.name);

  use(req: RequestWithId, res: Response, next: NextFunction): void {
    req.id = uuidv4();
    req.startTime = Date.now();

    const { method, url, ip, headers } = req;
    const userAgent = headers['user-agent'] || '';

    // Log incoming request
    this.logger.log(`[${req.id}] ${method} ${url} - ${ip} - ${userAgent}`);

    // Log response when finished
    res.on('finish', () => {
      const { statusCode } = res;
      const { startTime } = req;
      const duration = Date.now() - startTime;
      const contentLength = res.get('content-length') || '0';

      const logMessage = `[${req.id}] ${method} ${url} - ${statusCode} - ${duration}ms - ${contentLength} bytes`;

      if (statusCode >= 400) {
        this.logger.error(logMessage);
      } else if (statusCode >= 300) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}
