export default {
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
  storageTokenKeyName: 'accessToken',
};
