export interface AuthUser {
  id: string;
  username: string;
  role: string;
  status: string | null;
  account?: Record<string, unknown>;
  teacher?: Record<string, unknown>;
  student?: Record<string, unknown>;
  teacherOnClassroom?: string[];
}

export interface JwtPayload {
  sub: string;
  username: string;
  roles?: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: AuthUser;
  token: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  token: string;
}
