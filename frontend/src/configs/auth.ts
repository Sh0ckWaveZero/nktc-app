export default {
  meEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
  loginEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
  teacherListEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/teachers`,
  appbarEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/app-bar/search`,
  classroomListEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/classrooms`,
  registerEndpoint: '/jwt/register',
  storageTokenKeyName: 'accessToken',
};
