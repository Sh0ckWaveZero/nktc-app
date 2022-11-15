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
  programEndpoint?: string;
  registerEndpoint?: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const authConfig: AuthConfig = {
  meEndpoint: `${apiUrl}/auth/me`,
  loginEndpoint: `${apiUrl}/auth/login`,
  changePasswordEndpoint: `${apiUrl}/auth/update/password`,
  teacherEndpoint: `${apiUrl}/teachers`,
  studentEndpoint: `${apiUrl}/students`,
  appbarEndpoint: `${apiUrl}/app-bar/search`,
  classroomEndpoint: `${apiUrl}/classrooms`,
  reportCheckInEndpoint: `${apiUrl}/reportCheckIn`,
  departmentEndpoint: `${apiUrl}/departments`,
  programEndpoint: `${apiUrl}/programs`,
  registerEndpoint: '/jwt/register',
};
