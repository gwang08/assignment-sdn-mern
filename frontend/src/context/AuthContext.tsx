import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types';
import apiService from '../services/api';
import { message } from 'antd';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await apiService.login(credentials);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
        message.success('Đăng nhập thành công!');
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.message || 'Đăng nhập thất bại' });
        message.error(response.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      message.error(errorMessage);
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await apiService.register(userData);
      
      if (response.success) {
        message.success('Đăng ký thành công! Vui lòng đăng nhập.');
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data! });
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.message || 'Đăng ký thất bại' });
        message.error(response.message || 'Đăng ký thất bại');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      message.error(errorMessage);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    message.success('Đăng xuất thành công!');
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
