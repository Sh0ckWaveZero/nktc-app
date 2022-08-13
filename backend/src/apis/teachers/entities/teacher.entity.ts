import { ApiProperty } from "@nestjs/swagger";

export class Teacher {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string

  @ApiProperty()
  classId: string

  @ApiProperty()
  jobTitle: string;

  @ApiProperty()
  academicStanding: string;

  @ApiProperty()
  departmentId: string;

  @ApiProperty()
  rfId: string;

  @ApiProperty()
  idCard: string;

  @ApiProperty()
  birthDate: Date;

  @ApiProperty()
  user: string;

  @ApiProperty()
  class: string;
}
