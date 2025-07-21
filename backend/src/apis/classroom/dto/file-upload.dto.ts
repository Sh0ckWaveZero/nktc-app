import { ApiProperty } from '@nestjs/swagger';

export class ClassroomFileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description:
      'ไฟล์ XLSX ที่มีข้อมูลห้องเรียน (คอลัมน์หลัก: รหัส, ชื่อระดับชั้นเรียนสาขาวิชา, ระดับชั้น, เลขที่ห้องเรียน, สาขาวิชา, แผนกวิชา, รหัสแผนกวิชา)',
  })
  file: Express.Multer.File;
}
