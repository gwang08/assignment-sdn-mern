import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types';
import apiService from '../services/api';
import { message } from 'antd';

// Function to decode JWT token
const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

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
        const tokenPayload = decodeToken(token);
        
        // Add role from token to user object
        const userWithRole = {
          ...user,
          role: tokenPayload?.type || 'parent' // fallback to parent if no type
        };
        
        console.log('🔑 Token payload:', tokenPayload);
        console.log('👤 User with role:', userWithRole);
        
        dispatch({ type: 'AUTH_SUCCESS', payload: userWithRole });
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      // For testing purposes - auto login as parent
      const testParentUser = {
        _id: 'test-parent-id',
        username: 'test_parent',
        email: 'parent@test.com',
        role: 'parent' as const,
        first_name: 'Nguyễn',
        last_name: 'Văn A',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(testParentUser));
      dispatch({ type: 'AUTH_SUCCESS', payload: testParentUser });
    }
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await apiService.login(credentials);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        // Decode token to get role
        const tokenPayload = decodeToken(token);
        const userWithRole = {
          ...user,
          role: tokenPayload?.type || 'parent'
        };
        
        console.log('🔑 Login - Token payload:', tokenPayload);
        console.log('👤 Login - User with role:', userWithRole);
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userWithRole));
        
        dispatch({ type: 'AUTH_SUCCESS', payload: userWithRole });
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
