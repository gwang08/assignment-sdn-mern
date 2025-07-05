import { AxiosResponse } from 'axios';
import BaseApiClient from './baseApi';
import { ApiResponse, LoginRequest, LoginResponse, RegisterRequest, User } from '../../types';

class AuthService extends BaseApiClient {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    console.log('🌐 AuthService.login called with:', credentials);
    console.log('🌐 API base URL:', this.api.defaults.baseURL);
    
    try {
      const response: AxiosResponse<ApiResponse<LoginResponse>> = await this.api.post('/auth/login', credentials);
      console.log('📥 Login response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Login request failed:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/auth/profile');
    return response.data;
  }
}

const authService = new AuthService();
export default authService;
