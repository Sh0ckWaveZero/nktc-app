import { Classroom, Level, Program } from '../types/apps/teacherTypes';
export type ErrCallbackType = (err: { [key: string]: string }) => void;

export type LoginParams = {
  username: string;
  password: string;
};

export type RegisterParams = {
  email: string;
  username: string;
  password: string;
};

export interface UserDataType {
  id?: string;
  username?: string;
  email?: string | null;
  role?: string;
  status?: null;
  createdAt?: Date;
  updatedAt?: Date;
  updatedBy?: string;
  createdBy?: string;
  verificationToken?: null;
  refreshToken?: null;
  accessToken?: null;
  expiresAt?: null;
  account?: Account;
  teacher?: Teacher;
  student?: Student;
  teacherOnClassroom?: any;
}

export interface Account {
  id?: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  birthDate?: Date;
  idCard?: string;
}

export interface Teacher {
  id?: string;
  teacherId?: string;
  jobTitle?: string;
  academicStanding?: string;
  classrooms?: any[];
  department?: Department;
  status?: string;
}

export interface Student {
  id?: string;
  studentId?: string;
  isGraduation?: boolean;
  graduationYear?: number;
  graduationDate?: Date;
  studentStatus?: string;
  group?: string;
  status?: string;
  user?: UserDataType;
  userId?: string;
  classroom?: Classroom;
  classroomId?: string;
  department?: Department;
  departmentId?: string;
  program?: Program;
  programId?: string;
  level?: Level;
  levelId?: string;
  levelClassroom?: any;
  levelClassroomId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  updatedBy?: string;
  createdBy?: string;
}

export interface Department {
  id?: string;
  departmentId?: string;
  name?: string;
  description?: string;
  status?: null;
  createdAt?: Date;
  updatedAt?: Date;
  updatedBy?: string;
  createdBy?: string;
}

export type AuthValuesType = {
  loading: boolean;
  setLoading: (value: boolean) => void;
  logout: () => void;
  isInitialized: boolean;
  user: UserDataType | null;
  setUser: (value: UserDataType | null) => void;
  setIsInitialized: (value: boolean) => void;
  login: (params: LoginParams, errorCallback?: ErrCallbackType) => void;
  register: (params: RegisterParams, errorCallback?: ErrCallbackType) => void;
};
