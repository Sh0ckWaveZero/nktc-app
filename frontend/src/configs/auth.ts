type AuthConfig = {
  meEndpoint?: string;
  loginEndpoint?: string;
  changePasswordEndpoint?: string;
  teacherEndpoint?: string;
  studentEndpoint?: string;
  appbarEndpoint?: string;
  classroomEndpoint?: string;
  reportCheckInEndpoint?: string;
  activityCheckInEndpoint?: string;
  departmentEndpoint?: string;
  programEndpoint?: string;
  registerEndpoint?: string;
  goodnessIndividualEndpoint?: string;
  badnessIndividualEndpoint?: string;
  userEndpoint?: string;
  levelEndpoint?: string;
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
  activityCheckInEndpoint: `${apiUrl}/activity-check-in`,
  departmentEndpoint: `${apiUrl}/departments`,
  programEndpoint: `${apiUrl}/programs`,
  registerEndpoint: '/jwt/register',
  goodnessIndividualEndpoint: `${apiUrl}/goodness-individual`,
  badnessIndividualEndpoint: `${apiUrl}/badness-individual`,
  userEndpoint: `${apiUrl}/users`,
  levelEndpoint: `${apiUrl}/levels`,
};
