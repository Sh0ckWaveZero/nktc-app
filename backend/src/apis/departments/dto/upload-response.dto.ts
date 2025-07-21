import { ApiProperty } from '@nestjs/swagger';

export class DepartmentUploadResponseDto {
  @ApiProperty({ example: 12, description: 'จำนวนแผนกวิชาที่นำเข้าสำเร็จ' })
  importedCount: number;

  @ApiProperty({
    example: ['นำเข้าข้อมูลแผนกวิชา 12 รายการสำเร็จ'],
    description: 'ข้อความแจ้งผลการดำเนินการ',
  })
  messages: string[];

  @ApiProperty({ example: [], description: 'ข้อความแจ้งข้อผิดพลาด (ถ้ามี)' })
  errors: string[];

  @ApiProperty({ example: true, description: 'สถานะการดำเนินการ' })
  success: boolean;
}
