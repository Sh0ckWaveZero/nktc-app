import { ApiProperty } from '@nestjs/swagger';

export class StudentFileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description:
      'ไฟล์ XLSX ที่มีข้อมูลนักเรียน (คอลัมน์หลัก: เลขประจำตัวประชาชน, รหัสประจำตัว, กลุ่มเรียน, คำนำหน้าชื่อ, ชื่อ (ไทย), นามสกุล (ไทย), สาขาวิชา, แผนก, ประเภทนักเรียน)',
  })
  file: Express.Multer.File;
}
