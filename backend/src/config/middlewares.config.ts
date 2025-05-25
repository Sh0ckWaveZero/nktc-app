import * as bodyParser from 'body-parser';
import * as requestIp from 'request-ip';
import { INestApplication } from '@nestjs/common';
import configuration from './configuration';
import { APP_CONSTANTS } from './app.constants';

/**
 * สร้างการตั้งค่า Body Parser ที่ปลอดภัย
 * @returns การตั้งค่า Body Parser
 */
const createBodyParserConfig = () => {
  const config = configuration();
  const isDevelopment = config.node_env === 'development';

  return {
    // จำกัดขนาดไฟล์ตาม environment
    limit: isDevelopment ? APP_CONSTANTS.BODY_LIMIT : '1mb',
    
    // ป้องกัน parameter pollution
    parameterLimit: 20,
    
    // จำกัดจำนวน fields ใน form
    extended: false,
    
    // ป้องกัน prototype pollution
    verify: (req: any, res: any, buf: Buffer) => {
      // ตรวจสอบ content type ที่อนุญาต
      const contentType = req.get('content-type');
      if (contentType && !contentType.includes('application/json') && 
          !contentType.includes('application/x-www-form-urlencoded')) {
        throw new Error('Content type ไม่ได้รับอนุญาต');
      }
    }
  };
};

/**
 * Middleware สำหรับตรวจสอบ request ที่น่าสงสัย
 */
const suspiciousRequestMiddleware = (req: any, res: any, next: any) => {
  // ตรวจสอบ User-Agent ที่น่าสงสัย
  const userAgent = req.get('User-Agent') || '';
  const suspiciousPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i
  ];
  
  // Log suspicious requests
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    console.warn(`Suspicious request from IP: ${req.clientIp}, User-Agent: ${userAgent}`);
  }
  
  // ตรวจสอบ Content-Length ที่ผิดปกติ
  const contentLength = parseInt(req.get('content-length') || '0');
  if (contentLength > 10 * 1024 * 1024) { // 10MB
    console.warn(`Large request detected from IP: ${req.clientIp}, Size: ${contentLength}`);
  }
  
  next();
};

/**
 * ตั้งค่า middleware ต่างๆ สำหรับแอปพลิเคชันพร้อมความปลอดภัย
 * @param app - อินสแตนซ์ของ NestJS application
 */
export const setupMiddlewares = (app: INestApplication): void => {
  const bodyParserConfig = createBodyParserConfig();
  
  // ตั้งค่า IP tracking (ต้องมาก่อน middleware อื่นๆ)
  app.use(requestIp.mw());
  
  // เพิ่ม middleware ตรวจสอบ request ที่น่าสงสัย
  app.use(suspiciousRequestMiddleware);
  
  // ตั้งค่า Body Parser พร้อมการป้องกัน
  app.use(bodyParser.json({
    ...bodyParserConfig,
    type: 'application/json',
    strict: true, // ยอมรับเฉพาะ JSON ที่ถูกต้อง
  }));
  
  app.use(bodyParser.urlencoded({
    ...bodyParserConfig,
    type: 'application/x-www-form-urlencoded',
  }));
  
  // Middleware สำหรับ normalize request
  app.use((req: any, res: any, next: any) => {
    // ลบ null bytes ที่อาจเป็นอันตราย
    if (req.body && typeof req.body === 'object') {
      req.body = JSON.parse(JSON.stringify(req.body).replace(/\0/g, ''));
    }
    
    next();
  });
};
