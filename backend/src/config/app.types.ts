/**
 * ประเภทข้อมูลสำหรับการตั้งค่า CORS
 */
export interface CorsConfig {
  readonly origin: string;
  readonly allowedHeaders: string;
  readonly methods: string;
  readonly credentials: boolean;
}

/**
 * ประเภทข้อมูลสำหรับการตั้งค่า Swagger
 */
export interface SwaggerConfig {
  readonly title: string;
  readonly description: string;
  readonly version: string;
  readonly bearerAuth: boolean;
}
