import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/auth';
import { LoginInput } from '../utils/validators';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  cafeId: string | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [cafeId, setCafeId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadedToken = authService.getToken();
    const loadedUser = authService.getCurrentUser();
    const loadedRole = authService.getRole();
    const loadedCafeId = authService.getCafeId();

    if (loadedToken && loadedUser) {
      setToken(loadedToken);
      setUser(loadedUser);
      setRole(loadedRole);
      setCafeId(loadedCafeId);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginInput) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setRole(response.role);
      setCafeId(response.cafe_id);
      setToken(response.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setRole(null);
    setCafeId(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        cafeId,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
