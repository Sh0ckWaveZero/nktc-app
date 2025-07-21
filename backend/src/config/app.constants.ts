/**
 * ค่าคงที่สำหรับการตั้งค่าแอปพลิเคชัน
 */
export const APP_CONSTANTS = {
  BODY_LIMIT: '5mb',
  API_TITLE: 'NKTC-API',
  API_DESCRIPTION: 'The NKTC API description',
  API_VERSION: '1.0',
  SWAGGER_PATH: 'api',
  CORS_ALLOWED_HEADERS:
    'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe, authorization',
  CORS_ALLOWED_METHODS: 'GET,PUT,POST,PATCH,DELETE,UPDATE,OPTIONS',
  DEVELOPMENT_ORIGIN: '*',
  CORS_POLICY: 'cross-origin',
} as const;
