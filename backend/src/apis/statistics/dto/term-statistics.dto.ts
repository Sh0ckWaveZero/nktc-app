import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class TermStatisticsQueryDto {
  @ApiProperty({
    description: 'Start date of the term (ISO format)',
    example: '2024-01-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date of the term (ISO format)',
    example: '2024-06-30',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Academic year (optional)',
    example: '2567',
    required: false,
  })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiProperty({
    description: 'Department ID for filtering (optional)',
    example: 'dept-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty({
    description: 'Program ID for filtering (optional)',
    example: 'prog-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  programId?: string;
}

export class TermStatisticsResponseDto {
  @ApiProperty({
    description: 'Statistics about student check-in attendance',
  })
  studentCheckInStats: {
    totalStudents: number;
    studentsCheckedIn: number;
    checkInPercentage: number;
    studentsNotCheckedIn: number;
    notCheckedInPercentage: number;
    totalCheckInDays: number;
    averageAttendanceRate: number;
  };

  @ApiProperty({
    description: 'Statistics about teacher system usage',
  })
  teacherUsageStats: {
    totalTeachers: number;
    activeTeachers: number;
    activePercentage: number;
    inactiveTeachers: number;
    inactivePercentage: number;
    teacherActivityDetails: Array<{
      teacherId: string;
      teacherName: string;
      checkInCount: number;
      lastCheckInDate: Date | null;
      isActive: boolean;
    }>;
  };

  @ApiProperty({
    description: 'Daily attendance breakdown',
  })
  dailyBreakdown: Array<{
    date: Date;
    present: number;
    absent: number;
    late: number;
    leave: number;
    internship: number;
  }>;

  @ApiProperty({
    description: 'Classroom-wise statistics',
  })
  classroomStats: Array<{
    classroomId: string;
    classroomName: string;
    totalStudents: number;
    averageAttendance: number;
    checkInCount: number;
  }>;
}
