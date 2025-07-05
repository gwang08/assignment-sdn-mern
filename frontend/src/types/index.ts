export interface User {
  _id: string;
  username: string;
  email?: string;
  first_name: string;
  last_name: string;
  gender: "male" | "female" | "other";
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  phone_number?: string;
  role: "parent" | "student" | "medicalStaff" | "admin";
  is_active: boolean;
  last_login?: string;
  createdAt: string;
  updatedAt: string;

  // Student specific fields
  class_name?: string;

  // Medical staff specific fields
  staff_role?: "Nurse" | "Doctor" | "Healthcare Assistant";
}

export interface Student extends User {
  role: "student";
  class_name: string;
  student_id?: string;
}

export interface Parent extends User {
  role: "parent";
  email: string;
  phone_number: string;
}

export interface Admin extends User {
  role: "admin";
  email: string;
  phone_number: string;
}

export interface MedicalStaff extends User {
  role: "medicalStaff";
  email: string;
  phone_number: string;
  staff_role: "Nurse" | "Doctor" | "Healthcare Assistant";
  dateOfBirth?: string; // For backward compatibility
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
  event_type: "accident" | "illness" | "injury" | "emergency" | "other";
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  symptoms: string[];
  treatment_provided: string;
  medications_given: string[];
  status: "open" | "in_progress" | "resolved" | "referred";
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
  status?: "pending" | "approved" | "rejected" | "completed";
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
  type:
    | "Vaccination"
    | "Checkup"
    | "Health_Check"
    | "Nutrition_Program"
    | "Mental_Health";
  date: string;
  vaccineDetails?: {
    brand: string;
    batchNumber: string;
    dosage: string;
  };
  // Backward compatibility - always provide default values
  campaign_type: "vaccination" | "health_check" | "screening" | "other";
  target_classes: string[];
  start_date: string;
  end_date: string;
  created_by: string;
  status: "draft" | "active" | "completed" | "cancelled";
  requires_consent: boolean;
  consent_deadline?: string;
  instructions: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignConsent {
  _id: string;
  campaign: string | { _id: string; title?: string; campaign_type?: string };
  student: string | { _id: string; first_name?: string; last_name?: string };
  answered_by?: string | { _id: string; first_name?: string; last_name?: string };
  status: 'Pending' | 'Approved' | 'Declined';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignResult {
  _id?: string;
  campaign: string;
  created_by?: string;
  student: string;
  notes?: string;
  checkupDetails?: {
    findings?: string;
    recommendations?: string;
    status?: 'HEALTHY' | 'NEEDS_ATTENTION' | 'CRITICAL';
    requiresConsultation?: boolean;
    // Health check specific fields
    height?: number;
    weight?: number;
    vision?: string;
    bloodPressure?: string;
    heartRate?: number;
  };
  vaccination_details?: {
    vaccinated_at?: string;
    vaccine_details?: {
      brand?: string;
      batch_number?: string;
      dose_number?: number;
      expiry_date?: string;
    };
    administered_by?: string;
    side_effects?: string[];
    follow_up_required?: boolean;
    follow_up_date?: string;
    follow_up_notes?: string;
    additional_actions?: string[];
    status?: string;
    last_follow_up?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ConsultationSchedule {
  _id: string;
  campaignResult: string | CampaignResult;
  student: string | Student;
  medicalStaff: string | MedicalStaff;
  attending_parent: string | User;
  scheduledDate: string;
  duration: number;
  reason: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
  notificationsSent?: boolean;
  notes?: string;
  cancelReason?: string;
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
    gender: "male" | "female" | "other";
  };
  userType: "parent";
}

export interface DashboardStats {
  total_students: number;
  total_medical_events: number;
  active_campaigns: number;
  pending_medicine_requests: number;
  recent_events: MedicalEvent[];
  upcoming_campaigns: Campaign[];
}

export interface StudentParentRelation {
  _id: string;
  student: Student;
  parent: Parent;
  relationship: string;
  is_emergency_contact: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}
