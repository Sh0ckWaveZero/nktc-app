export type AuthConfig = {
  backEndUrl?: string;
  meEndpoint?: string;
  loginEndpoint?: string;
  logoutEndpoint?: string;
  refreshEndpoint?: string;
  changePasswordEndpoint?: string;
  teacherEndpoint?: string;
  studentEndpoint?: string;
  appbarEndpoint?: string;
  appbarDefaultSuggestionsEndpoint?: string;
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
  visitEndpoint?: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const authConfig: AuthConfig = {
  backEndUrl: apiUrl,
  meEndpoint: `${apiUrl}/auth/me`,
  loginEndpoint: `${apiUrl}/auth/login`,
  logoutEndpoint: `${apiUrl}/auth/logout`,
  refreshEndpoint: `${apiUrl}/auth/refresh`,
  changePasswordEndpoint: `${apiUrl}/auth/update/password`,
  teacherEndpoint: `${apiUrl}/teachers`,
  studentEndpoint: `${apiUrl}/students`,
  appbarEndpoint: `${apiUrl}/app-bar/search`,
  appbarDefaultSuggestionsEndpoint: `${apiUrl}/app-bar/default-suggestions`,
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
  visitEndpoint: `${apiUrl}/visits`,
};
