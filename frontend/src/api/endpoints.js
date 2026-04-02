export const API_ENDPOINTS = {
  HEALTH: '/health/',
  AUTH_REGISTER: '/auth/register/',
  AUTH_LOGIN: '/auth/login/',
  AUTH_REFRESH: '/auth/refresh/',
  AUTH_ME: '/auth/me/',
  APPLICATIONS: '/applications/',
  applicationDetail: (id) => `/applications/${id}/`,
  RESUMES: '/resumes/',
  resumeDetail: (id) => `/resumes/${id}/`,
  AI_MATCHES: '/ai/matches/',
  AI_MATCH: '/ai/match/',
};
