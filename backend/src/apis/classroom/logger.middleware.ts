import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware สำหรับ log HTTP requests อย่างปลอดภัย
 * กรองข้อมูลที่อาจเป็นอันตรายและวัดเวลาการทำงาน
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  /**
   * กรองข้อมูล headers ที่มีความสำคัญทางความปลอดภัย
   * @param headers - Headers จาก HTTP request
   * @returns Headers ที่ถูกกรองแล้ว
   */
  private filterSensitiveHeaders(
    headers: Record<string, any>,
  ): Record<string, any> {
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
    ];
    const filtered = { ...headers };

    sensitiveHeaders.forEach((header) => {
      if (filtered[header]) {
        filtered[header] = '[FILTERED]';
      }
    });

    return filtered;
  }

  /**
   * กรองข้อมูล body ที่มีความสำคัญทางความปลอดภัย
   * @param body - Request body ที่ต้องการกรอง
   * @returns Body ที่ถูกกรองแล้ว
   */
  private filterSensitiveBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
    ];
    const filtered = { ...body };

    sensitiveFields.forEach((field) => {
      if (filtered[field]) {
        filtered[field] = '[FILTERED]';
      }
    });

    return filtered;
  }

  /**
   * ประมวลผล HTTP request และ log ข้อมูลที่ปลอดภัย
   * @param req - Express Request object
   * @param res - Express Response object
   * @param next - Express NextFunction
   */
  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    this.logger.log(`${req.method} ${req.originalUrl} - Start`);

    const safeHeaders = this.filterSensitiveHeaders(req.headers);
    this.logger.debug(`Headers: ${JSON.stringify(safeHeaders)}`);

    const safeBody = this.filterSensitiveBody(req.body);
    this.logger.debug(`Body: ${JSON.stringify(safeBody)}`);

    if (req.file) {
      this.logger.debug(
        `File: ${req.file.fieldname}, ${req.file.originalname}, ${req.file.mimetype}, ${req.file.size} bytes`,
      );
    } else if (req.files) {
      const fileCount = Array.isArray(req.files)
        ? req.files.length
        : Object.keys(req.files).length;
      this.logger.debug(`Files count: ${fileCount}`);
    }

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.logger.log(
        `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`,
      );
    });

    next();
  }
}
