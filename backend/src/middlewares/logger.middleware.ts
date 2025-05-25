import { UAParser } from 'ua-parser-js';
import * as requestIp from 'request-ip';

import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';

import { PrismaService } from '../common/services/prisma.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  constructor(private readonly prisma: PrismaService) { }

  async use(req: any, res: Response, next: NextFunction) {
    try {
      const userAgent = req.get('User-Agent');
      const parser = new UAParser(userAgent);
      const result = parser.getResult();
      const { username, password } = req.body;
      const ipAddr = requestIp.getClientIp(req);

      // Record log to database
      await this.prisma.auditLog.create({
        data: {
          action: 'Login',
          model: 'User',
          fieldName: 'username',
          oldValue: null,
          newValue: username,
          detail: 'User login',
          ipAddr,
          browser: result.browser?.name || 'Unknown',
          device: result.device?.vendor || 'Unknown',
          createdBy: username,
        },
      });
    } catch (error) {
      this.logger.error('Error in LoggerMiddleware:', error);
    }

    next();
  }
}
