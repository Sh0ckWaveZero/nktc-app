import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware สำหรับตรวจสอบและบันทึก security events
 */
@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('User-Agent') || 'Unknown';

    // ตรวจสอบ suspicious patterns
    this.checkSuspiciousPatterns(req);

    // เพิ่ม security headers เพิ่มเติม
    this.addSecurityHeaders(res);

    // บันทึก request
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      
      if (statusCode >= 400) {
        this.logger.warn(
          `${method} ${originalUrl} ${statusCode} - ${ip} - ${userAgent} - ${duration}ms`
        );
      }

      // แจ้งเตือนสำหรับ status codes ที่น่าสงสัย
      if (statusCode === 401 || statusCode === 403) {
        this.logger.warn(`Unauthorized access attempt from ${ip} to ${originalUrl}`);
      }
    });

    next();
  }

  /**
   * ตรวจสอบ patterns ที่น่าสงสัยใน request
   */
  private checkSuspiciousPatterns(req: Request): void {
    const { originalUrl, body, query } = req;
    const userAgent = req.get('User-Agent') || '';

    // ตรวจสอบ SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/i,
      /(UNION|OR|AND)\s+\d+\s*=\s*\d+/i,
      /['"]\s*(OR|AND)\s+['"]/i
    ];

    // ตรวจสอบ XSS patterns
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<script[^>]*>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
      /vbscript:/gi,
      /<form[^>]*>.*?<\/form>/gi,
    ];

    // ตรวจสอบ path traversal
    const pathTraversalPatterns = [
      /\.\.\//,
      /\.\.\\/,
      /%2e%2e%2f/i,
      /%2e%2e%5c/i
    ];

    const allPatterns = [...sqlPatterns, ...xssPatterns, ...pathTraversalPatterns];
    const requestData = JSON.stringify({ url: originalUrl, body, query });

    if (allPatterns.some(pattern => pattern.test(requestData))) {
      this.logger.error(`Suspicious request detected from ${req.ip}: ${originalUrl}`);
    }

    // ตรวจสอบ bot/crawler patterns
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i
    ];

    if (botPatterns.some(pattern => pattern.test(userAgent))) {
      this.logger.warn(`Bot/Crawler detected: ${userAgent} from ${req.ip}`);
    }
  }

  /**
   * เพิ่ม security headers เพิ่มเติม
   */
  private addSecurityHeaders(res: Response): void {
    // ป้องกัน information disclosure
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, nosnippet, noarchive');
    
    // เพิ่ม cache control สำหรับ sensitive data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // เพิ่ม custom security identifier
    res.setHeader('X-Request-ID', this.generateRequestId());
  }

  /**
   * สร้าง unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
