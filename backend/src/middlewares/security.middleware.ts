import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

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
          `${method} ${originalUrl} ${statusCode} - ${ip} - ${userAgent} - ${duration}ms`,
        );
      }

      // แจ้งเตือนสำหรับ status codes ที่น่าสงสัย
      if (statusCode === 401 || statusCode === 403) {
        this.logger.warn(
          `Unauthorized access attempt from ${ip} to ${originalUrl}`,
        );
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
      /['"]\s*(OR|AND)\s+['"]/i,
    ];

    // ตรวจสอบ XSS patterns
    const xssPatterns = [
      /<script[^>]*?.*?<\/script>/gis,
      /<script[^>]*>/gi,
      /javascript\s*:/gi,
      /on(?:load|click|error|focus|blur|change|submit|mouseover|mouseout|keyup|keydown)\s*=/gi,
      /<iframe[^>]*?.*?<\/iframe>/gis,
      /eval\s*\(/gi,
      /expression\s*\(/gi,
      /<object[^>]*?.*?<\/object>/gis,
      /<embed[^>]*?.*?<\/embed>/gis,
      /vbscript\s*:/gi,
      /<form[^>]*?.*?<\/form>/gis,
      /data\s*:\s*text\/html/gi,
      /%3cscript/gi,
      /&lt;script/gi,
      /\\x3cscript/gi,
    ];

    // ตรวจสอบ path traversal
    const pathTraversalPatterns = [
      /\.\.\//,
      /\.\.\\/,
      /%2e%2e%2f/i,
      /%2e%2e%5c/i,
    ];

    const allPatterns = [
      ...sqlPatterns,
      ...xssPatterns,
      ...pathTraversalPatterns,
    ];
    const requestData = this.sanitizeForLogging({
      url: originalUrl,
      body,
      query,
    });

    for (const pattern of allPatterns) {
      if (pattern.test(requestData)) {
        this.logger.error(
          `Suspicious request detected from ${req.ip}: ${originalUrl}`,
        );
        // Set suspicious flag for potential rate limiting
        req['suspicious'] = true;
        break;
      }
    }

    // ตรวจสอบ bot/crawler patterns
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
    ];

    if (botPatterns.some((pattern) => pattern.test(userAgent))) {
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
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, private',
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self'; " +
        "font-src 'self'; " +
        "object-src 'none'; " +
        "media-src 'self'; " +
        "frame-src 'none';",
    );

    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()',
    );

    // เพิ่ม custom security identifier
    res.setHeader('X-Request-ID', this.generateRequestId());
  }

  /**
   * Sanitize request data for safe logging
   */
  private sanitizeForLogging(data: any): string {
    try {
      const sanitized = JSON.stringify(data, (key, value) => {
        if (typeof value === 'string') {
          // Remove potential sensitive data patterns
          return value
            .replace(/password/gi, '[REDACTED]')
            .replace(/token/gi, '[REDACTED]')
            .replace(/secret/gi, '[REDACTED]')
            .replace(/key/gi, '[REDACTED]')
            .substring(0, 1000); // Limit length
        }
        return value;
      });
      return sanitized || '{}';
    } catch {
      return '{"error": "failed_to_serialize"}';
    }
  }

  /**
   * สร้าง unique request ID
   */
  private generateRequestId(): string {
    const timestamp = Date.now();
    const randomBytes = createHash('sha256')
      .update(`${timestamp}-${Math.random()}-${process.hrtime.bigint()}`)
      .digest('hex')
      .substring(0, 12);
    return `req_${timestamp}_${randomBytes}`;
  }
}
