export interface User {
  _id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'student_manager' | 'Nurse' | 'Doctor' | 'Healthcare Assistant' | 'parent' | 'student';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Student extends User {
  class_name: string;
  gender: 'male' | 'female' | 'other';
  date_of_birth?: string;
  student_id?: string;
}

export interface Parent extends User {
  phone_number: string;
}

export interface MedicalStaff extends User {
  phone_number: string;
  department?: string;
  specialization?: string;
}

export interface HealthProfile {
  _id: string;
  student_id: string;
  allergies: string[];
  chronic_conditions: string[];
  medications: string[];
  medical_history: string[];
  vision_status: string;
  hearing_status: string;
  vaccination_records: VaccinationRecord[];
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
  student_id: string;
  parent_id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approved_by?: string;
  approved_at?: string;
  start_date: string;
  end_date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  _id: string;
  title: string;
  description: string;
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
  appointment_date: string;
  appointment_time: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
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
  userType: 'parent' | 'medicalStaff' | 'student' | 'admin';
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
  userType: 'parent' | 'medicalStaff' | 'student';
}

export interface DashboardStats {
  total_students: number;
  total_medical_events: number;
  active_campaigns: number;
  pending_medicine_requests: number;
  recent_events: MedicalEvent[];
  upcoming_campaigns: Campaign[];
}
