import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import configuration from 'src/config/configuration';
import * as requestIp from 'request-ip';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);
  use(req: any, res: Response, next: NextFunction) {
    const userAgent = req.get('User-Agent');
    this.logger.log(userAgent);
    this.logger.log(`User ${req?.body?.username} logged in from IP address ${requestIp.getClientIp(req)}`);
    next();
  }
}
