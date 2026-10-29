import { apiConfig } from '@/configs/api';

export type AuthConfig = {
  backEndUrl?: string;
  meEndpoint?: string;
  loginEndpoint?: string;
  logoutEndpoint?: string;
  refreshEndpoint?: string;
  prepareBetterAuthEndpoint?: string;
  tokenExchangeEndpoint?: string;
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
  statisticsEndpoint?: string;
  systemSettingsEndpoint?: string;
};

export const authConfig: AuthConfig = {
  backEndUrl: '',
  meEndpoint: apiConfig.endpoint('/auth/me'),
  loginEndpoint: apiConfig.endpoint('/auth/login'),
  logoutEndpoint: apiConfig.endpoint('/auth/logout'),
  refreshEndpoint: apiConfig.endpoint('/auth/refresh'),
  prepareBetterAuthEndpoint: apiConfig.endpoint('/auth/prepare-better-auth'),
  tokenExchangeEndpoint: apiConfig.endpoint('/auth/token-exchange'),
  changePasswordEndpoint: apiConfig.endpoint('/auth/update/password'),
  teacherEndpoint: apiConfig.endpoint('/teachers'),
  studentEndpoint: apiConfig.endpoint('/students'),
  appbarEndpoint: apiConfig.endpoint('/app-bar/search'),
  appbarDefaultSuggestionsEndpoint: apiConfig.endpoint('/app-bar/default-suggestions'),
  classroomEndpoint: apiConfig.endpoint('/classrooms'),
  reportCheckInEndpoint: apiConfig.endpoint('/reportCheckIn'),
  activityCheckInEndpoint: apiConfig.endpoint('/activity-check-in'),
  departmentEndpoint: apiConfig.endpoint('/departments'),
  programEndpoint: apiConfig.endpoint('/programs'),
  registerEndpoint: '/jwt/register',
  goodnessIndividualEndpoint: apiConfig.endpoint('/goodness-individual'),
  badnessIndividualEndpoint: apiConfig.endpoint('/badness-individual'),
  userEndpoint: apiConfig.endpoint('/users'),
  levelEndpoint: apiConfig.endpoint('/levels'),
  visitEndpoint: apiConfig.endpoint('/visits'),
  statisticsEndpoint: apiConfig.endpoint('/statistics'),
  systemSettingsEndpoint: apiConfig.endpoint('/system-settings'),
};
