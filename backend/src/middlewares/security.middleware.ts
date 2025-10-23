import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

/**
 * Middleware สำหรับตรวจสอบและบันทึก security events
 * ReDoS-safe implementation using string methods instead of complex regex
 */
@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('User-Agent') || 'Unknown';

    // ตรวจสอบ suspicious patterns with timeout protection
    try {
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('Pattern check timeout')), 100);
      });

      const patternCheckPromise = new Promise<void>((resolve) => {
        this.checkSuspiciousPatterns(req);
        resolve();
      });

      Promise.race([patternCheckPromise, timeoutPromise]).catch(() => {
        this.logger.error(`Pattern check timeout for request from ${req.ip}`);
        req['suspicious'] = true;
      });
    } catch (error) {
      this.logger.error(`Error in pattern checking: ${error.message}`);
      req['suspicious'] = true;
    }

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
   * ตรวจสอบ patterns ที่น่าสงสัยใน request - ReDoS safe version
   */
  private checkSuspiciousPatterns(req: Request): void {
    const { originalUrl, body, query } = req;
    const userAgent = req.get('User-Agent') || '';

    const requestData = this.sanitizeForLogging({
      url: originalUrl,
      body,
      query,
    });

    // Early return if data is too large to prevent ReDoS
    if (requestData.length > 10000) {
      this.logger.warn(
        `Large request data detected from ${req.ip}: ${originalUrl} (${requestData.length} chars)`,
      );
      req['suspicious'] = true;
      return;
    }

    // Use safe string matching instead of complex regex
    if (this.checkSqlInjection(requestData)) {
      this.logger.error(
        `SQL injection attempt detected from ${req.ip}: ${originalUrl}`,
      );
      req['suspicious'] = true;
      return;
    }

    if (this.checkXssAttempt(requestData)) {
      this.logger.error(`XSS attempt detected from ${req.ip}: ${originalUrl}`);
      req['suspicious'] = true;
      return;
    }

    if (this.checkPathTraversal(requestData)) {
      this.logger.error(
        `Path traversal attempt detected from ${req.ip}: ${originalUrl}`,
      );
      req['suspicious'] = true;
      return;
    }

    // Safe bot detection with simple string checks
    this.checkBotPatterns(userAgent, req.ip);
  }

  /**
   * Safe SQL injection detection using string methods
   */
  private checkSqlInjection(data: string): boolean {
    const lowerData = data.toLowerCase();
    const sqlKeywords = [
      'select ',
      'insert ',
      'update ',
      'delete ',
      'drop ',
      'create ',
      'alter ',
    ];
    const sqlPatterns = [
      'union select',
      'or 1=1',
      'and 1=1',
      "' or '",
      '" or "',
    ];

    return (
      sqlKeywords.some((keyword) => lowerData.includes(keyword)) &&
      sqlPatterns.some((pattern) => lowerData.includes(pattern))
    );
  }

  /**
   * Safe XSS detection using string methods
   */
  private checkXssAttempt(data: string): boolean {
    const lowerData = data.toLowerCase();
    const xssPatterns = [
      '<script',
      'javascript:',
      'onload=',
      'onclick=',
      'onerror=',
      '<iframe',
      'eval(',
      'expression(',
      'vbscript:',
      '%3cscript',
      '&lt;script',
      '\\x3cscript',
    ];

    return xssPatterns.some((pattern) => lowerData.includes(pattern));
  }

  /**
   * Safe path traversal detection
   */
  private checkPathTraversal(data: string): boolean {
    const lowerData = data.toLowerCase();
    const pathPatterns = ['../', '..\\', '%2e%2e%2f', '%2e%2e%5c'];

    return pathPatterns.some((pattern) => lowerData.includes(pattern));
  }

  /**
   * Safe bot pattern detection
   */
  private checkBotPatterns(userAgent: string, ip: string): void {
    if (userAgent.length > 500) {
      this.logger.warn(`Suspicious long user agent from ${ip}`);
      return;
    }

    const lowerAgent = userAgent.toLowerCase();
    const botKeywords = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget'];

    if (botKeywords.some((keyword) => lowerAgent.includes(keyword))) {
      this.logger.warn(
        `Bot/Crawler detected: ${userAgent.substring(0, 100)} from ${ip}`,
      );
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
   * Sanitize request data for safe logging with strict limits
   */
  private sanitizeForLogging(data: any): string {
    try {
      // Limit the depth and size of data to prevent DoS
      const sanitized = JSON.stringify(
        data,
        (key, value) => {
          if (typeof value === 'string') {
            // Truncate very long strings early
            if (value.length > 500) {
              return `[TRUNCATED:${value.length}chars]`;
            }
            // Remove potential sensitive data patterns using safe string methods
            const cleaned = value;
            const sensitivePatterns = {
              password: '[REDACTED]',
              token: '[REDACTED]',
              secret: '[REDACTED]',
              key: '[REDACTED]',
              authorization: '[REDACTED]',
              cookie: '[REDACTED]',
            };

            const lowerKey = key.toLowerCase();
            const lowerValue = value.toLowerCase();

            for (const [pattern, replacement] of Object.entries(
              sensitivePatterns,
            )) {
              if (lowerKey.includes(pattern) || lowerValue.includes(pattern)) {
                return replacement;
              }
            }

            return cleaned.substring(0, 200); // Strict length limit
          }
          return value;
        },
        2,
      ); // Limit depth to 2 levels

      // Final safety check on total length
      if (sanitized && sanitized.length > 2000) {
        return `{"truncated": "data_too_large_${sanitized.length}_chars"}`;
      }

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
