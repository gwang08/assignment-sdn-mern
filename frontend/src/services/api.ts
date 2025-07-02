import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  Student,
  MedicalStaff,
  HealthProfile,
  MedicalEvent,
  MedicineRequest,
  Campaign,
  CampaignConsent,
  CampaignResult,
  ConsultationSchedule,
  DashboardStats,
  StudentParentRelation,
  Parent,
} from "../types";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor để thêm token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`; // ✅ đúng format backend cần
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor để xử lý lỗi
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response: AxiosResponse<ApiResponse<LoginResponse>> =
      await this.api.post("/auth/login", credentials);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.post(
      "/auth/register",
      userData
    );
    return response.data;
  }

  // User management
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

  // Health Profile
  async getHealthProfile(
    studentId: string
  ): Promise<ApiResponse<HealthProfile>> {
    const response: AxiosResponse<ApiResponse<HealthProfile>> =
      await this.api.get(`/nurse/health-profile/${studentId}`);
    return response.data;
  }

  async updateHealthProfile(
    studentId: string,
    profileData: Partial<HealthProfile>
  ): Promise<ApiResponse<HealthProfile>> {
    const response: AxiosResponse<ApiResponse<HealthProfile>> =
      await this.api.put(`/nurse/health-profile/${studentId}`, profileData);
    return response.data;
  }

  // Medical Events
  async getMedicalEvents(): Promise<ApiResponse<MedicalEvent[]>> {
    const response: AxiosResponse<ApiResponse<MedicalEvent[]>> =
      await this.api.get("/nurse/medical-events");
    return response.data;
  }

  async createMedicalEvent(
    eventData: Partial<MedicalEvent>
  ): Promise<ApiResponse<MedicalEvent>> {
    const response: AxiosResponse<ApiResponse<MedicalEvent>> =
      await this.api.post("/nurse/medical-events", eventData);
    return response.data;
  }

  async updateMedicalEvent(
    eventId: string,
    eventData: Partial<MedicalEvent>
  ): Promise<ApiResponse<MedicalEvent>> {
    const response: AxiosResponse<ApiResponse<MedicalEvent>> =
      await this.api.put(`/nurse/medical-events/${eventId}`, eventData);
    return response.data;
  }

  // Medicine Requests
  async getMedicineRequests(): Promise<ApiResponse<MedicineRequest[]>> {
    const response: AxiosResponse<ApiResponse<MedicineRequest[]>> =
      await this.api.get("/nurse/medicine-requests");
    return response.data;
  }

  async createMedicineRequest(
    requestData: Partial<MedicineRequest>
  ): Promise<ApiResponse<MedicineRequest>> {
    const response: AxiosResponse<ApiResponse<MedicineRequest>> =
      await this.api.post("/parent/medicine-requests", requestData);
    return response.data;
  }

  async updateMedicineRequestStatus(
    requestId: string,
    status: string
  ): Promise<ApiResponse<MedicineRequest>> {
    const response: AxiosResponse<ApiResponse<MedicineRequest>> =
      await this.api.put(`/nurse/medicine-requests/${requestId}/status`, {
        status,
      });
    return response.data;
  }

  // Campaigns
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    const response: AxiosResponse<ApiResponse<Campaign[]>> = await this.api.get(
      "/nurse/campaigns"
    );
    return response.data;
  }

  async createCampaign(
    campaignData: Partial<Campaign>
  ): Promise<ApiResponse<Campaign>> {
    const response: AxiosResponse<ApiResponse<Campaign>> = await this.api.post(
      "/nurse/campaigns",
      campaignData
    );
    return response.data;
  }

  async updateCampaign(
    campaignId: string,
    campaignData: Partial<Campaign>
  ): Promise<ApiResponse<Campaign>> {
    const response: AxiosResponse<ApiResponse<Campaign>> = await this.api.put(
      `/nurse/campaigns/${campaignId}`,
      campaignData
    );
    return response.data;
  }

  // Campaign Consents
  async getCampaignConsents(
    campaignId: string
  ): Promise<ApiResponse<CampaignConsent[]>> {
    const response: AxiosResponse<ApiResponse<CampaignConsent[]>> =
      await this.api.get(`/nurse/campaigns/${campaignId}/consents`);
    return response.data;
  }

  async submitCampaignConsent(
    consentData: Partial<CampaignConsent>
  ): Promise<ApiResponse<CampaignConsent>> {
    const response: AxiosResponse<ApiResponse<CampaignConsent>> =
      await this.api.post("/parent/campaign-consents", consentData);
    return response.data;
  }

  // Campaign Results
  async getCampaignResults(
    campaignId: string
  ): Promise<ApiResponse<CampaignResult[]>> {
    const response: AxiosResponse<ApiResponse<CampaignResult[]>> =
      await this.api.get(`/nurse/campaigns/${campaignId}/results`);
    return response.data;
  }

  async submitCampaignResult(
    resultData: Partial<CampaignResult>
  ): Promise<ApiResponse<CampaignResult>> {
    const response: AxiosResponse<ApiResponse<CampaignResult>> =
      await this.api.post("/nurse/campaign-results", resultData);
    return response.data;
  }

  // Consultation Schedules
  async getConsultationSchedules(): Promise<
    ApiResponse<ConsultationSchedule[]>
  > {
    const response: AxiosResponse<ApiResponse<ConsultationSchedule[]>> =
      await this.api.get("/nurse/consultation-schedules");
    return response.data;
  }

  async createConsultationSchedule(
    scheduleData: Partial<ConsultationSchedule>
  ): Promise<ApiResponse<ConsultationSchedule>> {
    const response: AxiosResponse<ApiResponse<ConsultationSchedule>> =
      await this.api.post("/nurse/consultation-schedules", scheduleData);
    return response.data;
  }

  // Dashboard
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response: AxiosResponse<ApiResponse<DashboardStats>> =
      await this.api.get("/nurse/dashboard");
    return response.data;
  }

  // Parent specific endpoints
  async getParentProfile(): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get(
      "/parent/profile"
    );
    return response.data;
  }

  async getParentStudents(): Promise<ApiResponse<Student[]>> {
    const response: AxiosResponse<ApiResponse<Student[]>> = await this.api.get(
      "/parent/students"
    );
    return response.data;
  }

  async getStudentHealthProfile(
    studentId: string
  ): Promise<ApiResponse<HealthProfile>> {
    const response: AxiosResponse<ApiResponse<HealthProfile>> =
      await this.api.get(`/parent/students/${studentId}/health-profile`);
    return response.data;
  }

  async updateStudentHealthProfile(
    studentId: string,
    profileData: Partial<HealthProfile>
  ): Promise<ApiResponse<HealthProfile>> {
    const response: AxiosResponse<ApiResponse<HealthProfile>> =
      await this.api.put(
        `/parent/students/${studentId}/health-profile`,
        profileData
      );
    return response.data;
  }

  async createMedicineRequestForStudent(
    studentId: string,
    requestData: any
  ): Promise<ApiResponse<MedicineRequest>> {
    const response: AxiosResponse<ApiResponse<MedicineRequest>> =
      await this.api.post(
        `/parent/students/${studentId}/medicine-requests`,
        requestData
      );
    return response.data;
  }

  async getParentMedicineRequests(): Promise<ApiResponse<MedicineRequest[]>> {
    const response: AxiosResponse<ApiResponse<MedicineRequest[]>> =
      await this.api.get("/parent/medicine-requests");
    return response.data;
  }

  async getStudentMedicineRequests(
    studentId: string
  ): Promise<ApiResponse<MedicineRequest[]>> {
    const response: AxiosResponse<ApiResponse<MedicineRequest[]>> =
      await this.api.get(`/parent/students/${studentId}/medicine-requests`);
    return response.data;
  }

  async getStudentMedicalEvents(
    studentId: string
  ): Promise<ApiResponse<MedicalEvent[]>> {
    const response: AxiosResponse<ApiResponse<MedicalEvent[]>> =
      await this.api.get(`/parent/students/${studentId}/medical-events`);
    return response.data;
  }

  async getParentCampaigns(): Promise<ApiResponse<Campaign[]>> {
    const response: AxiosResponse<ApiResponse<Campaign[]>> = await this.api.get(
      "/parent/campaigns"
    );
    return response.data;
  }

  async updateCampaignConsent(
    studentId: string,
    campaignId: string,
    consentData: { status: string; notes?: string }
  ): Promise<ApiResponse<CampaignConsent>> {
    const response: AxiosResponse<ApiResponse<CampaignConsent>> =
      await this.api.put(
        `/parent/students/${studentId}/campaigns/${campaignId}/consent`,
        consentData
      );
    return response.data;
  }

  async getStudentCampaignResults(
    studentId: string
  ): Promise<ApiResponse<CampaignResult[]>> {
    const response: AxiosResponse<ApiResponse<CampaignResult[]>> =
      await this.api.get(`/parent/students/${studentId}/campaign-results`);
    return response.data;
  }

  async getParentConsultationSchedules(): Promise<
    ApiResponse<ConsultationSchedule[]>
  > {
    const response: AxiosResponse<ApiResponse<ConsultationSchedule[]>> =
      await this.api.get("/parent/consultation-schedules");
    return response.data;
  }

  async createConsultationRequest(
    requestData: Partial<ConsultationSchedule>
  ): Promise<ApiResponse<ConsultationSchedule>> {
    const response: AxiosResponse<ApiResponse<ConsultationSchedule>> =
      await this.api.post("/parent/consultation-requests", requestData);
    return response.data;
  }

  async requestStudentLink(linkData: {
    studentId: string;
    relationship: string;
    is_emergency_contact?: boolean;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post(
      "/parent/student-link/request",
      linkData
    );
    return response.data;
  }

  async getLinkRequests(): Promise<ApiResponse<any[]>> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get(
      "/parent/student-link/requests"
    );
    return response.data;
  }

  async getParentHealthProfiles(): Promise<ApiResponse<HealthProfile[]>> {
    try {
      // First get all students
      const studentsResponse = await this.getParentStudents();
      if (!studentsResponse.success || !studentsResponse.data) {
        return { success: false, message: "Failed to fetch students" };
      }

      // Then get health profile for each student
      const profiles: HealthProfile[] = [];
      for (const student of studentsResponse.data) {
        try {
          const profileResponse = await this.getStudentHealthProfile(
            student._id
          );
          if (profileResponse.success && profileResponse.data) {
            profiles.push(profileResponse.data);
          }
        } catch (error) {
          // Skip if student doesn't have a health profile yet
          console.warn(`No health profile found for student ${student._id}`);
        }
      }

      return { success: true, data: profiles };
    } catch (error) {
      console.error("Error fetching health profiles:", error);
      return { success: false, message: "Failed to fetch health profiles" };
    }
  }
}

export default new ApiService();
