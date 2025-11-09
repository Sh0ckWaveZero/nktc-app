import { INestApplication } from '@nestjs/common';
import configuration from './configuration';
import { APP_CONSTANTS } from './app.constants';
import { CorsConfig } from './app.types';

/**
 * สร้างรายการ origins ที่อนุญาต
 * @returns รายการ origins ที่ปลอดภัย
 */
const createAllowedOrigins = (): string[] => {
  const config = configuration();

  if (config.node_env === 'development') {
    // ใช้ค่า default สำหรับ development ถ้าไม่ได้กำหนด
    const defaultDevOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ];
    
    // รวมกับ origins ที่กำหนดใน environment variable
    const customDevOrigins = config.corsDevOrigins
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);
    
    return [...defaultDevOrigins, ...customDevOrigins];
  }

  // Production: ใช้เฉพาะ domains ที่กำหนดไว้
  const allowedHosts = config.host?.toString().split(',') || [];
  return allowedHosts.map((host) => `https://${host.trim()}`);
};

/**
 * แยก hostname จาก origin URL
 * @param origin - origin URL ที่ต้องการแยก
 * @returns hostname หรือ null ถ้าไม่สามารถ parse ได้
 */
const extractHostname = (origin: string): string | null => {
  try {
    const url = new URL(origin);
    return url.hostname;
  } catch {
    return null;
  }
};

/**
 * ตรวจสอบว่า hostname เป็น subdomain หรือ domain ที่ถูกต้อง
 * @param hostname - hostname ที่ต้องการตรวจสอบ
 * @param domain - domain ที่ต้องการตรวจสอบ (เช่น 'midseelee.com')
 * @returns true ถ้า hostname เป็น subdomain หรือ domain ที่ถูกต้อง
 */
const isValidDomain = (hostname: string, domain: string): boolean => {
  // ตรวจสอบ exact match
  if (hostname === domain) return true;
  
  // ตรวจสอบ subdomain (เช่น app.midseelee.com, test.midseelee.com, app.test.midseelee.com)
  // ต้องลงท้ายด้วย .domain เท่านั้น (ไม่ใช่ midseelee.com.evil.com)
  // ใช้ regex เพื่อตรวจสอบ domain boundary
  const domainPattern = new RegExp(`^([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.)*${domain.replace('.', '\\.')}$`);
  
  return domainPattern.test(hostname);
};

/**
 * ตรวจสอบว่า origin เป็น localhost หรือ local IP
 * @param hostname - hostname ที่ต้องการตรวจสอบ
 * @returns true ถ้าเป็น localhost หรือ local IP
 */
const isLocalhost = (hostname: string): boolean => {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('localhost:') ||
    hostname.startsWith('127.0.0.1:')
  );
};

/**
 * ตรวจสอบ origin ที่ส่งมา
 * @param origin - origin ที่ต้องการตรวจสอบ
 * @param allowedOrigins - รายการ origins ที่อนุญาต
 * @returns ผลการตรวจสอบ
 */
const isOriginAllowed = (
  origin: string | undefined,
  allowedOrigins: string[],
): boolean => {
  if (!origin) return true; // อนุญาต requests ที่ไม่มี origin (เช่น mobile apps, Postman)

  const config = configuration();
  const hostname = extractHostname(origin);

  // ถ้าไม่สามารถ parse hostname ได้ ให้ปฏิเสธ
  if (!hostname) {
    return false;
  }

  // ใน development mode: รองรับ IP addresses และ local network
  if (config.node_env === 'development') {
    // ตรวจสอบ exact match
    if (allowedOrigins.includes(origin)) return true;

    // รองรับ local IP addresses (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    const localIpPattern = /^(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)(:\d+)?$/;
    if (localIpPattern.test(hostname)) return true;

    // รองรับ localhost variants (ตรวจสอบ hostname เท่านั้น ไม่ใช่ path)
    if (isLocalhost(hostname)) return true;

    // รองรับ domains ที่กำหนดใน environment variable
    // ตรวจสอบ domain ที่ถูกต้องเท่านั้นเพื่อป้องกัน domain hijacking
    if (config.corsAllowedDomains && config.corsAllowedDomains.length > 0) {
      const isAllowedDomain = config.corsAllowedDomains.some((domain) =>
        isValidDomain(hostname, domain.trim()),
      );
      if (isAllowedDomain) return true;
    }
  }

  return allowedOrigins.some((allowedOrigin) => {
    // ตรวจสอบ exact match
    if (origin === allowedOrigin) return true;

    // ตรวจสอบ subdomain ใน production
    if (config.node_env === 'production') {
      const allowedDomain = allowedOrigin.replace('https://', '').replace('http://', '');
      const allowedHostname = extractHostname(allowedOrigin);
      
      if (allowedHostname && isValidDomain(hostname, allowedHostname)) {
        // ตรวจสอบ protocol ด้วย
        return origin.startsWith('https://');
      }
    }

    return false;
  });
};

/**
 * ตั้งค่า CORS สำหรับแอปพลิเคชันพร้อมความปลอดภัยขั้นสูง
 * @param app - อินสแตนซ์ของ NestJS application
 */
export const setupCors = (app: INestApplication): void => {
  const config = configuration();
  const allowedOrigins = createAllowedOrigins();

  const corsConfig: CorsConfig = {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin, allowedOrigins)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('ไม่อนุญาตให้เข้าถึงจาก origin นี้'), false);
      }
    },
    allowedHeaders: APP_CONSTANTS.CORS_ALLOWED_HEADERS,
    methods:
      config.node_env === 'development'
        ? APP_CONSTANTS.CORS_ALLOWED_METHODS
        : config.corsProductionMethods,
    credentials: true,
    maxAge: config.corsMaxAge,
    preflightContinue: false,
    optionsSuccessStatus: 204, // ใช้ 204 แทน 200 สำหรับ preflight
  };

  app.enableCors(corsConfig);

  // เพิ่ม middleware ตรวจสอบ referer header
  app.use((req: any, res: any, next: any) => {
    const referer = req.get('Referer') || req.get('Origin');

    if (req.method !== 'GET' && config.node_env === 'production') {
      if (!referer || !isOriginAllowed(referer, allowedOrigins)) {
        console.warn(
          `Suspicious request without valid referer from IP: ${req.clientIp}`,
        );
      }
    }

    next();
  });
};
