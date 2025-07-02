import { AxiosResponse } from 'axios';
import BaseApiClient from './baseApi';
import { 
  ApiResponse, 
  HealthProfile, 
  MedicalEvent, 
  MedicineRequest, 
  Campaign, 
  CampaignConsent, 
  CampaignResult, 
  ConsultationSchedule,
  DashboardStats 
} from '../../types';

class NurseService extends BaseApiClient {
  // Health Profile
  async getHealthProfile(studentId: string): Promise<ApiResponse<HealthProfile>> {
    const response: AxiosResponse<ApiResponse<HealthProfile>> = await this.api.get(`/nurse/health-profile/${studentId}`);
    return response.data;
  }

  async updateHealthProfile(studentId: string, profileData: Partial<HealthProfile>): Promise<ApiResponse<HealthProfile>> {
    const response: AxiosResponse<ApiResponse<HealthProfile>> = await this.api.put(`/nurse/health-profile/${studentId}`, profileData);
    return response.data;
  }

  // Medical Events
  async getMedicalEvents(): Promise<ApiResponse<MedicalEvent[]>> {
    const response: AxiosResponse<ApiResponse<MedicalEvent[]>> = await this.api.get('/nurse/medical-events');
    return response.data;
  }

  async createMedicalEvent(eventData: Partial<MedicalEvent>): Promise<ApiResponse<MedicalEvent>> {
    const response: AxiosResponse<ApiResponse<MedicalEvent>> = await this.api.post('/nurse/medical-events', eventData);
    return response.data;
  }

  async updateMedicalEvent(eventId: string, eventData: Partial<MedicalEvent>): Promise<ApiResponse<MedicalEvent>> {
    const response: AxiosResponse<ApiResponse<MedicalEvent>> = await this.api.put(`/nurse/medical-events/${eventId}`, eventData);
    return response.data;
  }

  // Medicine Requests
  async getMedicineRequests(): Promise<ApiResponse<MedicineRequest[]>> {
    const response: AxiosResponse<ApiResponse<MedicineRequest[]>> = await this.api.get('/nurse/medicine-requests');
    return response.data;
  }

  async updateMedicineRequestStatus(requestId: string, status: string): Promise<ApiResponse<MedicineRequest>> {
    const response: AxiosResponse<ApiResponse<MedicineRequest>> = await this.api.put(`/nurse/medicine-requests/${requestId}/status`, { status });
    return response.data;
  }

  // Campaigns
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    const response: AxiosResponse<ApiResponse<Campaign[]>> = await this.api.get('/nurse/campaigns');
    return response.data;
  }

  async createCampaign(campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    const response: AxiosResponse<ApiResponse<Campaign>> = await this.api.post('/nurse/campaigns', campaignData);
    return response.data;
  }

  async updateCampaign(campaignId: string, campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    const response: AxiosResponse<ApiResponse<Campaign>> = await this.api.put(`/nurse/campaigns/${campaignId}`, campaignData);
    return response.data;
  }

  // Campaign Consents
  async getCampaignConsents(campaignId: string): Promise<ApiResponse<CampaignConsent[]>> {
    const response: AxiosResponse<ApiResponse<CampaignConsent[]>> = await this.api.get(`/nurse/campaigns/${campaignId}/consents`);
    return response.data;
  }

  // Campaign Results
  async getCampaignResults(campaignId: string): Promise<ApiResponse<CampaignResult[]>> {
    const response: AxiosResponse<ApiResponse<CampaignResult[]>> = await this.api.get(`/nurse/campaigns/${campaignId}/results`);
    return response.data;
  }

  async submitCampaignResult(resultData: Partial<CampaignResult>): Promise<ApiResponse<CampaignResult>> {
    const response: AxiosResponse<ApiResponse<CampaignResult>> = await this.api.post('/nurse/campaign-results', resultData);
    return response.data;
  }

  // Consultation Schedules
  async getConsultationSchedules(): Promise<ApiResponse<ConsultationSchedule[]>> {
    const response: AxiosResponse<ApiResponse<ConsultationSchedule[]>> = await this.api.get('/nurse/consultation-schedules');
    return response.data;
  }

  async createConsultationSchedule(scheduleData: Partial<ConsultationSchedule>): Promise<ApiResponse<ConsultationSchedule>> {
    const response: AxiosResponse<ApiResponse<ConsultationSchedule>> = await this.api.post('/nurse/consultation-schedules', scheduleData);
    return response.data;
  }

  // Dashboard
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response: AxiosResponse<ApiResponse<DashboardStats>> = await this.api.get('/nurse/dashboard');
    return response.data;
  }
}

const nurseService = new NurseService();
export default nurseService;
