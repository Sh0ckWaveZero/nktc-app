import { ApiProperty } from '@nestjs/swagger';

export class Student {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  studentId: string;

  @ApiProperty()
  studentNo: string;

  @ApiProperty()
  classId: string;

  @ApiProperty()
  departmentId: string;
}
