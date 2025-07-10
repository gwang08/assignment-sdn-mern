import { AxiosResponse } from "axios";
import {
  ApiResponse,
  Campaign,
  CampaignConsent,
  CampaignResult,
  ConsultationSchedule,
  DashboardStats,
  HealthProfile,
  MedicalEventNurse,
  MedicineRequest,
  StudentParentRelation,
} from "../../types";
import BaseApiClient from "./baseApi";

class NurseService extends BaseApiClient {

  // Health Profile
  async getAllHealthProfiles(): Promise<ApiResponse<HealthProfile[]>> {
    const response: AxiosResponse<ApiResponse<HealthProfile[]>> =
      await this.api.get("/nurse/students/health-profile");
    return response.data;
  }

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
  async getMedicalEvents(): Promise<ApiResponse<MedicalEventNurse[]>> {
    const response: AxiosResponse<ApiResponse<MedicalEventNurse[]>> =
      await this.api.get("/nurse/medical-events");
    return response.data;
  }

  async createMedicalEvent(
    eventData: Partial<MedicalEventNurse>
  ): Promise<ApiResponse<MedicalEventNurse>> {
    const response: AxiosResponse<ApiResponse<MedicalEventNurse>> =
      await this.api.post("/nurse/medical-events", eventData);
    return response.data;
  }

  async updateMedicalEvent(
    eventId: string,
    eventData: Partial<MedicalEventNurse>
  ): Promise<ApiResponse<MedicalEventNurse>> {
    const response: AxiosResponse<ApiResponse<MedicalEventNurse>> =
      await this.api.put(`/nurse/medical-events/${eventId}`, eventData);
    return response.data;
  }

  async resolveMedicalEvent(
    eventId: string,
    data: Partial<MedicalEventNurse>
  ): Promise<ApiResponse<MedicalEventNurse>> {
    const response: AxiosResponse<ApiResponse<MedicalEventNurse>> =
      await this.api.put(`/nurse/medical-events/${eventId}/resolve`, data);
    return response.data;
  }

  // Medicine Requests
  async getMedicineRequests(): Promise<ApiResponse<MedicineRequest[]>> {
    const response: AxiosResponse<ApiResponse<MedicineRequest[]>> =
      await this.api.get("/nurse/medicine-requests");
    return response.data;
  }

  async getNurseMedicineRequests(): Promise<MedicineRequest[]> {
    const response: AxiosResponse<MedicineRequest[]> = await this.api.get(
      "/nurse/medicine-requests"
    );

    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      throw new Error("Lỗi khi lấy dữ liệu");
    }
  }

  async updateMedicineRequestStatus(
    requestId: string,
    payload: { status: string; notes?: string }
  ): Promise<ApiResponse<MedicineRequest>> {
    const response: AxiosResponse<ApiResponse<MedicineRequest>> =
      await this.api.put(
        `/nurse/medicine-requests/${requestId}/status`,
        payload
      );

    return response.data;
  }

  // Campaigns
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    const response: AxiosResponse<ApiResponse<Campaign[]>> = await this.api.get(
      "/nurse/campaigns"
    );
    return response.data;
  }

  async getHealthCheckCampaigns(): Promise<ApiResponse<Campaign[]>> {
    const response: AxiosResponse<ApiResponse<Campaign[]>> = await this.api.get(
      "/nurse/health-check-campaigns"
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

  async checkConsultationOverlap(overlapData: {
    scheduledDate: string;
    duration: number;
  }): Promise<
    ApiResponse<{ hasOverlap: boolean; conflictingConsultation?: any }>
  > {
    const response: AxiosResponse<
      ApiResponse<{ hasOverlap: boolean; conflictingConsultation?: any }>
    > = await this.api.post(
      "/nurse/consultation-schedules/check-overlap",
      overlapData
    );
    return response.data;
  }

  // Thêm phương thức mới để hủy lịch tư vấn
  async cancelConsultationSchedule(
    consultationId: string,
    data: { cancelReason: string }
  ): Promise<ApiResponse<ConsultationSchedule>> {
    const response: AxiosResponse<ApiResponse<ConsultationSchedule>> =
      await this.api.put(`/nurse/consultation/${consultationId}/cancel`, data);
    return response.data;
  }

  // Dashboard
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response: AxiosResponse<ApiResponse<DashboardStats>> =
      await this.api.get("/nurse");
    return response.data;
  }

  // Vaccination Management
  async getVaccinationCampaigns(): Promise<ApiResponse<Campaign[]>> {
    const response: AxiosResponse<ApiResponse<Campaign[]>> = await this.api.get(
      "/nurse/vaccination-campaigns"
    );
    return response.data;
  }

  async createVaccinationCampaign(
    campaignData: Partial<Campaign>
  ): Promise<ApiResponse<Campaign>> {
    const response: AxiosResponse<ApiResponse<Campaign>> = await this.api.post(
      "/nurse/vaccination-campaigns",
      campaignData
    );
    return response.data;
  }

  async updateCampaignStatus(
    campaignId: string,
    status: string
  ): Promise<ApiResponse<Campaign>> {
    const response: AxiosResponse<ApiResponse<Campaign>> = await this.api.put(
      `/nurse/vaccination-campaigns/${campaignId}/status`,
      { status }
    );
    return response.data;
  }

  async getVaccinationList(campaignId: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
      `/nurse/vaccination-campaigns/${campaignId}/list`
    );
    return response.data;
  }

  async recordVaccination(
    campaignId: string,
    vaccinationData: any
  ): Promise<ApiResponse<CampaignResult>> {
    const response: AxiosResponse<ApiResponse<CampaignResult>> =
      await this.api.post(
        `/nurse/vaccination-campaigns/${campaignId}/record`,
        vaccinationData
      );
    return response.data;
  }

  async createConsentNotifications(
    campaignId: string
  ): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post(
      `/nurse/vaccination-campaigns/${campaignId}/create-consents`
    );
    return response.data;
  }

  async updateVaccinationFollowUp(
    resultId: string,
    followUpData: any
  ): Promise<ApiResponse<CampaignResult>> {
    const response: AxiosResponse<ApiResponse<CampaignResult>> =
      await this.api.put(
        `/nurse/vaccination-results/${resultId}/follow-up`,
        followUpData
      );
    return response.data;
  }

  async getVaccinationStatistics(): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
      "/nurse/vaccination-statistics"
    );
    return response.data;
  }

  // Medical Staff Management
  async getMedicalStaff(): Promise<ApiResponse<any[]>> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get(
      "/nurse/medical-staff"
    );
    return response.data;
  }

  // Student Management
  async getStudents(): Promise<ApiResponse<any[]>> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get(
      "/nurse/students"
    );
    return response.data;
  }

  // Student-Parent Relations
  async getStudentParentRelations(): Promise<
    ApiResponse<StudentParentRelation[]>
  > {
    const response: AxiosResponse<ApiResponse<StudentParentRelation[]>> =
      await this.api.get("/nurse/student-parent-relations");
    return response.data;
  }
}

const nurseService = new NurseService();
export default nurseService;
