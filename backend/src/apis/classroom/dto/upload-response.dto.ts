import { ApiProperty } from '@nestjs/swagger';

export class ClassroomUploadResponseDto {
  @ApiProperty({ example: 15, description: 'จำนวนห้องเรียนที่นำเข้าสำเร็จ' })
  importedCount: number;

  @ApiProperty({ example: ['นำเข้าห้องเรียนสำเร็จ 15 รายการ'], description: 'ข้อความแจ้งเกี่ยวกับการนำเข้าข้อมูล' })
  messages: string[];
  
  @ApiProperty({ example: ['ไม่พบข้อมูลในบรรทัดที่ 3'], description: 'ข้อความแจ้งข้อผิดพลาด (ถ้ามี)' })
  errors: string[];

  @ApiProperty({ example: true, description: 'สถานะความสำเร็จของการดำเนินการ' })
  success: boolean;
}
