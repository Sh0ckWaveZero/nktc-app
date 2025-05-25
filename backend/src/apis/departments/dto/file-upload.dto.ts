import { ApiProperty } from '@nestjs/swagger';

export class FileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'ไฟล์ XLSX ที่มีข้อมูลแผนกวิชา (คอลัมน์หลัก: รหัสแผนกวิชา, ชื่อแผนกวิชา, รายละเอียด)',
  })
  file: Express.Multer.File;
}
