import axios from 'axios';

export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      // 项目使用 HashRouter，跳转需写 hash；登录/注册页自身的 401 不重定向
      const hash = window.location.hash;
      if (!hash.startsWith('#/login') && !hash.startsWith('#/register')) {
        window.location.hash = '#/login';
      }
    }
    return Promise.reject(error);
  },
);
