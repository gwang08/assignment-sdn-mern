import { AxiosResponse } from "axios";
import {
  ApiResponse,
  MedicalStaff,
  Parent,
  Student,
  StudentParentRelation,
  User,
} from "../../types";
import BaseApiClient from "./baseApi";

class AdminService extends BaseApiClient {
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get(
      "/auth/profile"
    );
    return response.data;
  }
  async getParents(): Promise<ApiResponse<Parent[]>> {
    const response: AxiosResponse<ApiResponse<Parent[]>> = await this.api.get(
      "/admin/parents"
    );
    return response.data;
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    const response: AxiosResponse<ApiResponse<User[]>> = await this.api.get(
      "/users"
    );
    return response.data;
  }

  async createStudent(
    studentData: Partial<Student>
  ): Promise<ApiResponse<Student>> {
    const response: AxiosResponse<ApiResponse<Student>> = await this.api.post(
      "/admin/students",
      studentData
    );
    return response.data;
  }

  async getStudents(): Promise<ApiResponse<Student[]>> {
    const response: AxiosResponse<ApiResponse<Student[]>> = await this.api.get(
      "/admin/students"
    );
    return response.data;
  }
  async updateStudent(
    studentId: string,
    studentData: Partial<Student>
  ): Promise<ApiResponse<Student>> {
    const response: AxiosResponse<ApiResponse<Student>> = await this.api.put(
      `/admin/students/${studentId}`,
      studentData
    );
    return response.data;
  }
  async deactivateStudent(studentId: string): Promise<ApiResponse<Student>> {
    const response: AxiosResponse<ApiResponse<Student>> = await this.api.put(
      `/admin/students/${studentId}/deactivate`
    );
    return response.data;
  }

  async createMedicalStaff(
    staffData: Partial<MedicalStaff>
  ): Promise<ApiResponse<MedicalStaff>> {
    const response: AxiosResponse<ApiResponse<MedicalStaff>> =
      await this.api.post("/admin/medical-staff", staffData);
    return response.data;
  }

  async getMedicalStaff(): Promise<ApiResponse<MedicalStaff[]>> {
    const response: AxiosResponse<ApiResponse<MedicalStaff[]>> =
      await this.api.get("/admin/medical-staff");
    return response.data;
  }
  async updateMedicalStaff(
    staffId: string,
    staffData: Partial<MedicalStaff>
  ): Promise<ApiResponse<MedicalStaff>> {
    const response: AxiosResponse<ApiResponse<MedicalStaff>> =
      await this.api.put(`/admin/medical-staff/${staffId}`, staffData);
    return response.data;
  }
  async deactivateMedicalStaff(
    staffId: string
  ): Promise<ApiResponse<MedicalStaff>> {
    const response: AxiosResponse<ApiResponse<MedicalStaff>> =
      await this.api.put(`/admin/medical-staff/${staffId}/deactivate`);
    return response.data;
  }
  // Student-Parent Relations
  async createStudentParentRelation(data: {
    studentId: string;
    parentId: string;
    relationship: string;
    is_emergency_contact?: boolean;
  }): Promise<ApiResponse<StudentParentRelation>> {
    const response: AxiosResponse<ApiResponse<StudentParentRelation>> =
      await this.api.post("/admin/student-parent-relations", data);
    return response.data;
  }

  async getStudentParentRelations(): Promise<
    ApiResponse<StudentParentRelation[]>
  > {
    const response: AxiosResponse<ApiResponse<StudentParentRelation[]>> =
      await this.api.get("/admin/student-parent-relations");
    return response.data;
  }
  async getPendingLinkRequests(): Promise<
    ApiResponse<StudentParentRelation[]>
  > {
    const response: AxiosResponse<ApiResponse<StudentParentRelation[]>> =
      await this.api.get("/admin/student-link/requests");
    return response.data;
  }
  async respondToLinkRequest(
    requestId: string,
    status: "approved" | "rejected",
    notes?: string
  ): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.put(
      `/admin/student-link/requests/${requestId}`,
      { status, notes }
    );
    return response.data;
  }
}

const adminService = new AdminService();
export default adminService;
