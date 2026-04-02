export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  APPLICATION_DETAIL: '/applications/:id',
  RESUME_UPLOAD: '/resumes/upload',
};

export const buildApplicationDetailRoute = (id) => `/applications/${id}`;
