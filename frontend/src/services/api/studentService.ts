import { AxiosResponse } from "axios";
import BaseApiClient from "./baseApi";
import {
  ApiResponse,
  HealthProfile,
  MedicalEvent,
} from "../../types";

class StudentService extends BaseApiClient {

  // ✅ GET /student/health-profile - Không cần studentId vì dùng token authentication
  async getStudentSelfHealthProfile(): Promise<ApiResponse<HealthProfile>> {
    const response: AxiosResponse<ApiResponse<HealthProfile>> =
      await this.api.get("/student/health-profile");
    return response.data;
  }

  // ✅ GET /student/medical-events
  async getMedicalEvents(): Promise<ApiResponse<MedicalEvent[]>> {
    const response: AxiosResponse<ApiResponse<MedicalEvent[]>> =
      await this.api.get("/student/medical-events");
    return response.data;
  }
}
const studentService = new StudentService();
export default studentService;
