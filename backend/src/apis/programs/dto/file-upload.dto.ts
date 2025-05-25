import { ApiProperty } from '@nestjs/swagger';

export class ProgramFileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'ไฟล์ XLSX ที่มีข้อมูลโปรแกรม',
  })
  file: Express.Multer.File;
}
