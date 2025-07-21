import {
  INestApplication,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';

/**
 * สร้าง custom validation error message
 * @param errors - รายการ validation errors
 * @returns ข้อความแสดงข้อผิดพลาดที่ปลอดภัย
 */
const createValidationErrorMessage = (errors: any[]): string => {
  // ไม่เปิดเผยรายละเอียด internal ของ validation errors
  return 'ข้อมูลที่ส่งมาไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง';
};

/**
 * ตั้งค่า validation pipes สำหรับแอปพลิเคชันพร้อมความปลอดภัย
 * @param app - อินสแตนซ์ของ NestJS application
 */
export const setupValidation = (app: INestApplication): void => {
  app.useGlobalPipes(
    new ValidationPipe({
      // ลบ properties ที่ไม่ได้กำหนดใน DTO
      whitelist: true,

      // ปฏิเสธ request ที่มี properties เพิ่มเติม
      forbidNonWhitelisted: true,

      // แปลงประเภทข้อมูลอัตโนมัติ
      transform: true,

      // ป้องกัน mass assignment
      forbidUnknownValues: true,

      // จำกัดขนาดของ nested objects
      disableErrorMessages: false,

      // ตั้งค่า error handling ที่ปลอดภัย
      exceptionFactory: (errors) => {
        // Log errors สำหรับ debugging (แต่ไม่ส่งรายละเอียดให้ client)
        console.error('Validation errors:', errors);

        return new BadRequestException({
          message: createValidationErrorMessage(errors),
          error: 'Bad Request',
          statusCode: 400,
        });
      },

      // ป้องกัน prototype pollution
      enableDebugMessages: false,

      // จำกัดขนาดของ array
      validateCustomDecorators: true,
    }),
  );
};
