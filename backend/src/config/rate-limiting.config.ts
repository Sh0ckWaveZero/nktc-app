import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './configuration';

/**
 * สร้างการตั้งค่า Rate Limiting ที่เข้ากันได้กับเวอร์ชันปัจจุบัน
 * @returns ThrottlerModule configuration
 */
export const createSimpleRateLimitingModule = () => {
  const config = configuration();
  const isDevelopment = config.node_env === 'development';

  return ThrottlerModule.forRoot([
    {
      ttl: 60000, // 1 นาที
      limit: isDevelopment ? 1000 : 100, // development: 1000 req/min, production: 100 req/min
    }
  ]);
};
