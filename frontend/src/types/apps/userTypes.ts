// User domain type definitions
import { UserDataType, Account, Teacher, Student, Department } from '@/context/types';

export type { UserDataType, Account, Teacher, Student, Department };

// API Request/Response types
export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  data?: UserDataType;
}

export interface ResetPasswordByAdminRequest {
  teacher: {
    id: string;
  };
  newPassword: string;
}

export interface AuditLogParams {
  userName: string;
  skip?: number;
  take?: number;
}

export interface AuditLog {
  id: string;
  action: 'CheckIn' | 'Login' | string;
  model: string;
  recordId: string | null;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  detail: string;
  ipAddr: string;
  browser: string;
  device: string;
  createdAt: Date;
  createdBy: string;
  userId?: string;
}

/** Backend ส่งกลับเป็น plain array หรือ object { data, total } */
export type AuditLogsResponse = AuditLog[] | { data: AuditLog[]; total: number };

export interface UserByIdResponse {
  data: UserDataType;
}

export interface CreateUserRequest {
  username: string;
  email?: string;
  password: string;
  role: string;
  account?: Partial<Account>;
  teacher?: Partial<Teacher>;
  student?: Partial<Student>;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: string;
}

// Error types
export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
  details?: Record<string, any>;
}
