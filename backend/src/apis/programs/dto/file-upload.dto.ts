import { ApiProperty } from '@nestjs/swagger';

export class FileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'ไฟล์ XLSX ที่มีข้อมูลโปรแกรม',
  })
  file: any;
}
