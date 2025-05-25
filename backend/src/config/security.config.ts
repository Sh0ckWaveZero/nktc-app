import helmet from 'helmet';
import { INestApplication } from '@nestjs/common';
import configuration from './configuration';
import { APP_CONSTANTS } from './app.constants';

/**
 * สร้างการตั้งค่า Content Security Policy (CSP)
 * @returns การตั้งค่า CSP
 */
const createCSPConfig = () => {
  const config = configuration();
  const isDevelopment = config.node_env === 'development';

  const directives: Record<string, string[]> = {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    imgSrc: ["'self'", 'data:', 'https:'],
    scriptSrc: isDevelopment 
      ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"] 
      : ["'self'"],
    objectSrc: ["'none'"],
    frameSrc: ["'none'"],
    connectSrc: ["'self'"],
    manifestSrc: ["'self'"],
    mediaSrc: ["'self'"],
    workerSrc: ["'self'"],
  };

  // เพิ่ม upgradeInsecureRequests เฉพาะ production
  if (!isDevelopment) {
    directives.upgradeInsecureRequests = [];
  }

  return { directives };
};

/**
 * สร้างการตั้งค่า Helmet ตาม environment
 * @returns การตั้งค่า Helmet
 */
const createHelmetConfig = () => {
  const config = configuration();
  const isDevelopment = config.node_env === 'development';

  return {
    contentSecurityPolicy: isDevelopment ? false : createCSPConfig(),
    crossOriginEmbedderPolicy: false, // สำหรับ API server
    crossOriginResourcePolicy: { policy: APP_CONSTANTS.CORS_POLICY as 'cross-origin' | 'same-origin' | 'same-site' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' as const },
    hidePoweredBy: true,
    hsts: isDevelopment ? false : {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: 'no-referrer' as const },
    xssFilter: true,
  };
};

/**
 * ตั้งค่าความปลอดภัยด้วย Helmet middleware พร้อม security headers ที่ครบถ้วน
 * @param app - อินสแตนซ์ของ NestJS application
 */
export const setupSecurity = (app: INestApplication): void => {
  const helmetConfig = createHelmetConfig();
  
  // ตั้งค่า Helmet พร้อม configuration ที่กำหนดเอง
  app.use(helmet(helmetConfig));
  
  // เพิ่ม custom security headers
  app.use((req, res, next) => {
    // ป้องกัน clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // ป้องกัน MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // ป้องกัน XSS attacks
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // ซ่อนข้อมูล server
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    
    // เพิ่ม Permissions Policy
    res.setHeader('Permissions-Policy', 
      'camera=(), microphone=(), geolocation=(), payment=()'
    );
    
    next();
  });
};
