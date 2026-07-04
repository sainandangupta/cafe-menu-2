import axios from 'axios';
import { message } from 'antd';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token and cafe_id headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    const cafeId = localStorage.getItem('cafe_id');
    if (cafeId && !config.url?.includes('/auth/login')) {
      // Pass cafe_id in headers or search params
      config.headers['X-Cafe-ID'] = cafeId;
      if (config.method === 'get') {
        config.params = {
          ...config.params,
          cafe_id: cafeId,
        };
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle global errors (401, 403, 400, 500)
api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.status === 'success' && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('cafe_id');
      message.error('Session expired. Please log in again.');
      // Redirect to login page
      window.location.href = '/login';
    } else if (status === 403) {
      message.error('Access forbidden: You do not have permission.');
    } else if (status === 400) {
      message.error(errorMessage);
    } else if (status >= 500) {
      message.error('Server error: Please try again later.');
    }

    return Promise.reject(error);
  }
);
export default api;
