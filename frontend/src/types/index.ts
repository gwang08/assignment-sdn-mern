export interface User {
  _id: string;
  username: string;
  email?: string;
  first_name: string;
  last_name: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  phone_number?: string;
  role: 'parent' | 'student' | 'medicalStaff' | 'admin';
  is_active: boolean;
  last_login?: string;
  createdAt: string;
  updatedAt: string;
  
  // Student specific fields
  class_name?: string;
  
  // Medical staff specific fields
  staff_role?: 'Nurse' | 'Doctor' | 'Healthcare Assistant';
}

export interface Student extends User {
  role: 'student';
  class_name: string;
}

export interface Parent extends User {
  role: 'parent';
  email: string;
  phone_number: string;
}

export interface Admin extends User {
  role: 'admin';
  email: string;
  phone_number: string;
}

export interface MedicalStaff extends User {
  role: 'medicalStaff';
  email: string;
  phone_number: string;
  staff_role: 'Nurse' | 'Doctor' | 'Healthcare Assistant';
}

export interface HealthProfile {
  _id: string;
  student_id?: string;
  student?: string;
  allergies?: any[];
  chronic_conditions?: any[];
  chronicDiseases?: any[];
  medications?: any[];
  medical_history?: any[];
  treatmentHistory?: any[];
  vaccinations?: any[];
  vaccination_records?: VaccinationRecord[];
  vision_status?: string;
  vision?: {
    leftEye?: number;
    rightEye?: number;
  };
  hearing_status?: string;
  hearing?: {
    leftEar?: string;
    rightEar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VaccinationRecord {
  vaccine_name: string;
  date_administered: string;
  dose_number: number;
  administered_by: string;
  lot_number?: string;
  expiration_date?: string;
  notes?: string;
}

export interface MedicalEvent {
  _id: string;
  student_id: string;
  event_type: 'accident' | 'illness' | 'injury' | 'emergency' | 'other';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string[];
  treatment_provided: string;
  medications_given: string[];
  status: 'open' | 'in_progress' | 'resolved' | 'referred';
  created_by: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  follow_up_notes?: string;
  parent_notified: boolean;
  notification_sent_at?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineRequest {
  _id: string;
  student_id?: string;
  student?: Student;
  parent_id?: string;
  medicine_name?: string;
  medicines?: Medicine[];
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  approved_by?: string;
  approved_at?: string;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  notes?: string;
  created_by?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  notes?: string;
}

export interface Campaign {
  _id: string;
  title: string;
  description?: string;
  type: 'Vaccination' | 'Checkup' | 'Health_Check' | 'Nutrition_Program' | 'Mental_Health';
  date: string;
  vaccineDetails?: {
    brand: string;
    batchNumber: string;
    dosage: string;
  };
  // Backward compatibility - always provide default values
  campaign_type: 'vaccination' | 'health_check' | 'screening' | 'other';
  target_classes: string[];
  start_date: string;
  end_date: string;
  created_by: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  requires_consent: boolean;
  consent_deadline?: string;
  instructions: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignConsent {
  _id: string;
  campaign_id: string;
  student_id: string;
  parent_id: string;
  consent_given: boolean;
  consent_date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignResult {
  _id: string;
  campaign_id: string;
  student_id: string;
  participated: boolean;
  results: {
    [key: string]: any;
  };
  notes?: string;
  follow_up_required: boolean;
  follow_up_notes?: string;
  conducted_by: string;
  conducted_at: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationSchedule {
  _id: string;
  student_id: string;
  parent_id: string;
  medical_staff_id: string;
  appointment_date?: string;
  appointment_time?: string;
  scheduledDate?: string; // Alternative field name from API
  duration?: number;
  reason: string;
  consultation_type?: 'in_person' | 'phone' | 'video';
  status: 'requested' | 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  doctor_notes?: string;
  follow_up_required?: boolean;
  follow_up_date?: string;
  attending_parent?: string;
  notificationsSent?: boolean;
  // Populated fields from API
  student?: Student;
  medicalStaff?: MedicalStaff;
  campaignResult?: CampaignResult;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  userData: {
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    gender: 'male' | 'female' | 'other';
  };
  userType: 'parent';
}

export interface DashboardStats {
  total_students: number;
  total_medical_events: number;
  active_campaigns: number;
  pending_medicine_requests: number;
  recent_events: MedicalEvent[];
  upcoming_campaigns: Campaign[];
}
