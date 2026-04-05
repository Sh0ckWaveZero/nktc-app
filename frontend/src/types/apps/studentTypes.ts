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
  level?: StudentLevel;
  program?: StudentProgram;
  department?: StudentDepartment;
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
  level?: StudentLevel;
  department?: StudentDepartment;
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

export interface StudentAccount {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  idCard: string;
  phone: string;
  avatar: string | null;
  birthDate: string | null;
  addressLine1: string | null;
  subdistrict: string | null;
  district: string | null;
  province: string | null;
  postcode: string | null;
}

export interface StudentUser {
  id: string;
  email: string | null;
  username: string;
  role: string;
  account: StudentAccount;
}

export interface StudentData {
  id: string;
  studentId: string;
  status: string;
  userId: string;
  user: StudentUser;
  classroomId: string | null;
  classroom: StudentClassroom | null;
  program: StudentProgram | null;
  department: StudentDepartment | null;
  level: StudentLevel | null;
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