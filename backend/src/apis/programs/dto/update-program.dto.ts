import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

/**
 * DTO สำหรับการอัพเดทข้อมูลสาขาวิชา
 */
export class UpdateProgramDto {
  @ApiProperty({
    description: 'รหัสสาขาวิชา',
    example: 'P001',
    required: false,
  })
  @IsString()
  @IsOptional()
  programId?: string;

  @ApiProperty({
    description: 'ชื่อสาขาวิชา/หลักสูตร',
    example: 'วิชาการบัญชี',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'รายละเอียดของสาขาวิชา/หลักสูตร',
    example: 'หลักสูตรบัญชีทั่วไป',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'รหัสระดับการศึกษา',
    example: 'cmb2cuxje0001bn1u1c6oxvgg',
    required: false,
  })
  @IsString()
  @IsOptional()
  levelId?: string;

  @ApiProperty({
    description: 'รหัสแผนก/สาขา',
    example: 'cmb2dv9se000987xm6rq6i1ij',
    required: false,
  })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiProperty({
    description: 'สถานะของสาขาวิชา',
    example: 'active',
    enum: ['active', 'inactive'],
    required: false,
  })
  @IsString()
  @IsIn(['active', 'inactive'])
  @IsOptional()
  status?: string;
}
