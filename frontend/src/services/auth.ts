import api from './api';
import { LoginInput } from '../utils/validators';
import { User, UserRole } from '../types';

interface LoginResponse {
  token: string;
  role: UserRole;
  cafe_id: string | null;
  user: User;
}

export const authService = {
  login: async (credentials: LoginInput): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    const { token, role, cafe_id, user } = response.data;
    const finalRole = role || user?.role;
    
    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('role', finalRole || '');
    if (cafe_id) {
      localStorage.setItem('cafe_id', cafe_id);
    } else {
      localStorage.removeItem('cafe_id');
    }
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('cafe_id');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getCafeId: (): string | null => {
    return localStorage.getItem('cafe_id');
  },

  getRole: (): UserRole | null => {
    return localStorage.getItem('role') as UserRole | null;
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
};
