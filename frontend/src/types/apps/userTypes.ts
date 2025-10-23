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
  detail: string;
  ipAddr: string;
  browser: string;
  device: string;
  createdAt: Date;
  userId: string;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  total: number;
}

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
