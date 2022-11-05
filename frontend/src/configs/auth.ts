type AuthConfig = {
  meEndpoint?: string;
  loginEndpoint?: string;
  changePasswordEndpoint?: string;
  teacherEndpoint?: string;
  studentEndpoint?: string;
  appbarEndpoint?: string;
  classroomEndpoint?: string;
  reportCheckInEndpoint?: string;
  departmentEndpoint?: string;
  registerEndpoint?: string;
  accessToken?: string;
}

export const authConfig: AuthConfig = {
  meEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
  loginEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
  changePasswordEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/auth/update/password`,
  teacherEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/teachers`,
  studentEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/students`,
  appbarEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/app-bar/search`,
  classroomEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/classrooms`,
  reportCheckInEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/reportCheckIn`,
  departmentEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/departments`,
  registerEndpoint: '/jwt/register',
  accessToken: 'accessToken',
};
