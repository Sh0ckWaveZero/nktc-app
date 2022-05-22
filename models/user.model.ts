export interface User {
  id?: number;
  userName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiration?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}