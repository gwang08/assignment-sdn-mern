import { AxiosResponse } from 'axios';
import BaseApiClient from './baseApi';
import { 
  ApiResponse, 
  User,
  Student,
  HealthProfile, 
  MedicalEvent, 
  MedicineRequest, 
  Campaign, 
  CampaignConsent, 
  CampaignResult, 
  ConsultationSchedule
} from '../../types';

class ParentService extends BaseApiClient {
  // Profile
  async getParentProfile(): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/parent/profile');
    return response.data;
  }

  // Students
  async getParentStudents(): Promise<ApiResponse<Student[]>> {
    const response: AxiosResponse<ApiResponse<Student[]>> = await this.api.get('/parent/students');
    return response.data;
  }

  // Health Profile
  async getStudentHealthProfile(studentId: string): Promise<ApiResponse<HealthProfile>> {
    const response: AxiosResponse<ApiResponse<HealthProfile>> = await this.api.get(`/parent/students/${studentId}/health-profile`);
    return response.data;
  }

  async updateStudentHealthProfile(studentId: string, profileData: Partial<HealthProfile>): Promise<ApiResponse<HealthProfile>> {
    const response: AxiosResponse<ApiResponse<HealthProfile>> = await this.api.put(`/parent/students/${studentId}/health-profile`, profileData);
    return response.data;
  }

  async getParentHealthProfiles(): Promise<ApiResponse<HealthProfile[]>> {
    try {
      // First get all students
      const studentsResponse = await this.getParentStudents();
      if (!studentsResponse.success || !studentsResponse.data) {
        return { success: false, message: 'Failed to fetch students' };
      }

      // Extract student data from the response format
      const studentData = studentsResponse.data.map((item: any) => item.student);

      // Then get health profile for each student
      const profiles: HealthProfile[] = [];
      for (const student of studentData) {
        try {
          const profileResponse = await this.getStudentHealthProfile(student._id);
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
      console.error('Error fetching health profiles:', error);
      return { success: false, message: 'Failed to fetch health profiles' };
    }
  }

  // Medicine Requests
  async createMedicineRequest(requestData: Partial<MedicineRequest>): Promise<ApiResponse<MedicineRequest>> {
    const response: AxiosResponse<ApiResponse<MedicineRequest>> = await this.api.post('/parent/medicine-requests', requestData);
    return response.data;
  }

  async createMedicineRequestForStudent(studentId: string, requestData: any): Promise<ApiResponse<MedicineRequest>> {
    const response: AxiosResponse<ApiResponse<MedicineRequest>> = await this.api.post(`/parent/students/${studentId}/medicine-requests`, requestData);
    return response.data;
  }

  async getParentMedicineRequests(): Promise<ApiResponse<MedicineRequest[]>> {
    const response: AxiosResponse<ApiResponse<MedicineRequest[]>> = await this.api.get('/parent/medicine-requests');
    return response.data;
  }

  async getStudentMedicineRequests(studentId: string): Promise<ApiResponse<MedicineRequest[]>> {
    const response: AxiosResponse<ApiResponse<MedicineRequest[]>> = await this.api.get(`/parent/students/${studentId}/medicine-requests`);
    return response.data;
  }

  // Medical Events
  async getStudentMedicalEvents(studentId: string): Promise<ApiResponse<MedicalEvent[]>> {
    const response: AxiosResponse<ApiResponse<MedicalEvent[]>> = await this.api.get(`/parent/students/${studentId}/medical-events`);
    return response.data;
  }

  // Campaigns
  async getParentCampaigns(): Promise<ApiResponse<Campaign[]>> {
    const response: AxiosResponse<ApiResponse<Campaign[]>> = await this.api.get('/parent/campaigns');
    return response.data;
  }

  async submitCampaignConsent(consentData: Partial<CampaignConsent>): Promise<ApiResponse<CampaignConsent>> {
    const response: AxiosResponse<ApiResponse<CampaignConsent>> = await this.api.post('/parent/campaign-consents', consentData);
    return response.data;
  }

  async updateCampaignConsent(studentId: string, campaignId: string, consentData: { status: string; notes?: string }): Promise<ApiResponse<CampaignConsent>> {
    const response: AxiosResponse<ApiResponse<CampaignConsent>> = await this.api.put(`/parent/students/${studentId}/campaigns/${campaignId}/consent`, consentData);
    return response.data;
  }

  async getStudentCampaignResults(studentId: string): Promise<ApiResponse<CampaignResult[]>> {
    const response: AxiosResponse<ApiResponse<CampaignResult[]>> = await this.api.get(`/parent/students/${studentId}/campaign-results`);
    return response.data;
  }

  // Consultation Schedules
  async getParentConsultationSchedules(): Promise<ApiResponse<ConsultationSchedule[]>> {
    const response: AxiosResponse<ApiResponse<ConsultationSchedule[]>> = await this.api.get('/parent/consultation-schedules');
    return response.data;
  }

  async createConsultationRequest(requestData: Partial<ConsultationSchedule>): Promise<ApiResponse<ConsultationSchedule>> {
    const response: AxiosResponse<ApiResponse<ConsultationSchedule>> = await this.api.post('/parent/consultation-requests', requestData);
    return response.data;
  }

  // Student Link
  async requestStudentLink(linkData: { studentId: string; relationship: string; is_emergency_contact?: boolean; notes?: string }): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post('/parent/student-link/request', linkData);
    return response.data;
  }

  async getLinkRequests(): Promise<ApiResponse<any[]>> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get('/parent/student-link/requests');
    return response.data;
  }
}

const parentService = new ParentService();
export default parentService;
