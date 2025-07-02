import { AxiosResponse } from 'axios';
import BaseApiClient from './baseApi';
import { ApiResponse, User, Student, MedicalStaff } from '../../types';

class AdminService extends BaseApiClient {
  async getUsers(): Promise<ApiResponse<User[]>> {
    const response: AxiosResponse<ApiResponse<User[]>> = await this.api.get('/admin/users');
    return response.data;
  }

  async createStudent(studentData: Partial<Student>): Promise<ApiResponse<Student>> {
    const response: AxiosResponse<ApiResponse<Student>> = await this.api.post('/admin/students', studentData);
    return response.data;
  }

  async getStudents(): Promise<ApiResponse<Student[]>> {
    const response: AxiosResponse<ApiResponse<Student[]>> = await this.api.get('/admin/students');
    return response.data;
  }

  async createMedicalStaff(staffData: Partial<MedicalStaff>): Promise<ApiResponse<MedicalStaff>> {
    const response: AxiosResponse<ApiResponse<MedicalStaff>> = await this.api.post('/admin/medical-staff', staffData);
    return response.data;
  }

  async getMedicalStaff(): Promise<ApiResponse<MedicalStaff[]>> {
    const response: AxiosResponse<ApiResponse<MedicalStaff[]>> = await this.api.get('/admin/medical-staff');
    return response.data;
  }
}

const adminService = new AdminService();
export default adminService;
