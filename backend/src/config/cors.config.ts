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
    return [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'https://app-test.midseelee.com',
    ];
  }

  // Production: ใช้เฉพาะ domains ที่กำหนดไว้
  const allowedHosts = config.host?.toString().split(',') || [];
  return allowedHosts.map((host) => `https://${host.trim()}`);
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

  // ใน development mode: รองรับ IP addresses และ local network
  if (config.node_env === 'development') {
    // ตรวจสอบ exact match
    if (allowedOrigins.includes(origin)) return true;

    // รองรับ local IP addresses (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    const localIpPattern = /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)(:\d+)?$/;
    if (localIpPattern.test(origin)) return true;

    // รองรับ localhost variants
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;

    // รองรับ domain ที่มี midseelee.com
    if (origin.includes('midseelee.com')) return true;
  }

  return allowedOrigins.some((allowedOrigin) => {
    // ตรวจสอบ exact match
    if (origin === allowedOrigin) return true;

    // ตรวจสอบ subdomain ใน production
    if (config.node_env === 'production') {
      const allowedDomain = allowedOrigin.replace('https://', '');
      return (
        origin.endsWith(`.${allowedDomain}`) && origin.startsWith('https://')
      );
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
        : 'GET,POST,PUT,PATCH,DELETE', // ลบ OPTIONS และ UPDATE ใน production
    credentials: true,
    maxAge: 86400, // Cache preflight response for 24 hours
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
