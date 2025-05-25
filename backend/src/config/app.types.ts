/**
 * ประเภทข้อมูลสำหรับการตั้งค่า CORS
 */
export interface CorsConfig {
  readonly origin: string | string[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
  readonly allowedHeaders: string;
  readonly methods: string;
  readonly credentials: boolean;
  readonly maxAge?: number;
  readonly preflightContinue?: boolean;
  readonly optionsSuccessStatus?: number;
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
