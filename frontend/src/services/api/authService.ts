import { AxiosResponse } from 'axios';
import BaseApiClient from './baseApi';
import { ApiResponse, LoginRequest, LoginResponse, RegisterRequest, User } from '../../types';

class AuthService extends BaseApiClient {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await this.api.post('/auth/login', credentials);
    return response.data;
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
