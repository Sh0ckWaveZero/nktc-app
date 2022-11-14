import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import configuration from 'src/config/configuration';
import * as requestIp from 'request-ip';
import * as UAParser from 'ua-parser-js';
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);
  use(req: any, res: Response, next: NextFunction) {

    const userAgent = req.get('User-Agent');
    this.logger.log(userAgent);

    // UAParser
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    this.logger.log(result);
    this.logger.log(`User ${req?.body?.username} logged in from IP address ${requestIp.getClientIp(req)}`);
    next();
  }
}
