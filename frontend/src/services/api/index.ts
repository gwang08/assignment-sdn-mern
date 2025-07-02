// Import all services first
import authService from './authService';
import adminService from './adminService';
import nurseService from './nurseService';
import parentService from './parentService';

// Export all services
export { default as authService } from './authService';
export { default as adminService } from './adminService';
export { default as nurseService } from './nurseService';
export { default as parentService } from './parentService';

// For backward compatibility, create a combined API service

class ApiService {
  // Auth methods
  login = authService.login.bind(authService);
  register = authService.register.bind(authService);
  getCurrentUser = authService.getCurrentUser.bind(authService);

  // Admin methods
  getUsers = adminService.getUsers.bind(adminService);
  createStudent = adminService.createStudent.bind(adminService);
  getStudents = adminService.getStudents.bind(adminService);
  createMedicalStaff = adminService.createMedicalStaff.bind(adminService);
  getMedicalStaff = adminService.getMedicalStaff.bind(adminService);

  // Nurse methods
  getHealthProfile = nurseService.getHealthProfile.bind(nurseService);
  updateHealthProfile = nurseService.updateHealthProfile.bind(nurseService);
  getMedicalEvents = nurseService.getMedicalEvents.bind(nurseService);
  createMedicalEvent = nurseService.createMedicalEvent.bind(nurseService);
  updateMedicalEvent = nurseService.updateMedicalEvent.bind(nurseService);
  getMedicineRequests = nurseService.getMedicineRequests.bind(nurseService);
  updateMedicineRequestStatus = nurseService.updateMedicineRequestStatus.bind(nurseService);
  getCampaigns = nurseService.getCampaigns.bind(nurseService);
  createCampaign = nurseService.createCampaign.bind(nurseService);
  updateCampaign = nurseService.updateCampaign.bind(nurseService);
  getCampaignConsents = nurseService.getCampaignConsents.bind(nurseService);
  getCampaignResults = nurseService.getCampaignResults.bind(nurseService);
  submitCampaignResult = nurseService.submitCampaignResult.bind(nurseService);
  getConsultationSchedules = nurseService.getConsultationSchedules.bind(nurseService);
  createConsultationSchedule = nurseService.createConsultationSchedule.bind(nurseService);
  getDashboardStats = nurseService.getDashboardStats.bind(nurseService);

  // Parent methods
  getParentProfile = parentService.getParentProfile.bind(parentService);
  getParentStudents = parentService.getParentStudents.bind(parentService);
  getStudentHealthProfile = parentService.getStudentHealthProfile.bind(parentService);
  updateStudentHealthProfile = parentService.updateStudentHealthProfile.bind(parentService);
  getParentHealthProfiles = parentService.getParentHealthProfiles.bind(parentService);
  createMedicineRequest = parentService.createMedicineRequest.bind(parentService);
  createMedicineRequestForStudent = parentService.createMedicineRequestForStudent.bind(parentService);
  getParentMedicineRequests = parentService.getParentMedicineRequests.bind(parentService);
  getStudentMedicineRequests = parentService.getStudentMedicineRequests.bind(parentService);
  getStudentMedicalEvents = parentService.getStudentMedicalEvents.bind(parentService);
  getParentCampaigns = parentService.getParentCampaigns.bind(parentService);
  submitCampaignConsent = parentService.submitCampaignConsent.bind(parentService);
  updateCampaignConsent = parentService.updateCampaignConsent.bind(parentService);
  getStudentCampaignResults = parentService.getStudentCampaignResults.bind(parentService);
  getParentConsultationSchedules = parentService.getParentConsultationSchedules.bind(parentService);
  createConsultationRequest = parentService.createConsultationRequest.bind(parentService);
  requestStudentLink = parentService.requestStudentLink.bind(parentService);
  getLinkRequests = parentService.getLinkRequests.bind(parentService);
}

const apiService = new ApiService();
export default apiService;
