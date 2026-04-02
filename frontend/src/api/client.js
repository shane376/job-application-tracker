import axios from 'axios';
import { API_ENDPOINTS } from './endpoints';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
});

let isRefreshing = false;
let refreshPromise = null;

const clearAuthTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

const refreshAccessToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available.');
  }

  refreshPromise = apiClient
    .post(API_ENDPOINTS.AUTH_REFRESH, { refresh: refreshToken }, { skipAuthRefresh: true })
    .then((response) => {
      const nextAccessToken = response.data?.access;
      if (!nextAccessToken) {
        throw new Error('Refresh endpoint did not return an access token.');
      }
      localStorage.setItem('access_token', nextAccessToken);
      return nextAccessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    if (
      error.response?.status === 401
      && !originalRequest._retry
      && !originalRequest.skipAuthRefresh
    ) {
      try {
        originalRequest._retry = true;
        isRefreshing = true;
        const nextAccessToken = await refreshAccessToken();
        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${nextAccessToken}`,
        };
        return apiClient(originalRequest);
      } catch (_refreshError) {
        clearAuthTokens();
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401 && !isRefreshing) {
      clearAuthTokens();
    }

    return Promise.reject(error);
  },
);

export default apiClient;
