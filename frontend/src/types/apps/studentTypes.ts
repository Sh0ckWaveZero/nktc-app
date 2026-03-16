/**
 * Student Types
 * Type definitions for student data and related entities
 */

export interface StudentLevel {
  id: string;
  levelId: string;
  levelName: string;
  levelFullName: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  createdBy: string;
}

export interface StudentLevelClassroom {
  id: string;
  levelClassroomId: string;
  name: string;
  description: string | null;
  status: string | null;
  programId: string | null;
  levelId: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
  createdBy: string | null;
  classroomIds: string[];
}

export interface StudentClassroom {
  id: string;
  classroomId: string;
  name: string;
  description: string | null;
  teacherIds: string[];
  levelId: string;
  programId: string | null;
  departmentId: string;
  status: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
  createdBy: string | null;
  levelClassroomIds: string[];
}

export interface StudentProgram {
  id: string;
  programId: string;
  name: string;
  description: string;
  levelId: string;
  departmentId: string;
  status: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  createdBy: string;
}

export interface StudentDepartment {
  id: string;
  departmentId: string;
  name: string;
  description: string | null;
  status: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
  createdBy: string | null;
}

export interface StudentData {
  id: string;
  studentId: string;
  title: string;
  firstName: string;
  lastName: string;
  idCard: string;
  phone: string;
  status: string;
  avatar: string | null;
  level: StudentLevel;
  levelClassroom: StudentLevelClassroom;
  classroom: StudentClassroom;
  program: StudentProgram;
  department: StudentDepartment | null;
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta: {
    timestamp: string;
    path: string;
    method: string;
    duration: number;
  };
}