const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// Import Models
const User = require("../models/user/user");
const HealthProfile = require("../models/healthProfile");
const Campaign = require("../models/campaign/campaign");
const CampaignConsent = require("../models/campaign/campaignConsent");
const CampaignResult = require("../models/campaign/campaignResult");
const ConsultationSchedule = require("../models/campaign/consultationSchedule");
const StudentParent = require("../models/user/studentParent");
const MedicalEvent = require("../models/medicalEvent");
const MedicineRequest = require("../models/medicineRequest");

// Import Enums
const { 
  ALLERGY_SEVERITY, 
  CHRONIC_DISEASE_STATUS, 
  CAMPAIGN_TYPE,
  EVENT_TYPE,
  EVENT_SEVERITY,
  EVENT_STATUS
} = require("../utils/enums");

// Define missing enums locally
const MEDICINE_REQUEST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  EXPIRED: "expired"
};

/**
 * Sample data seeder for the School Health Management System
 */
class SampleDataSeeder {
  constructor() {
    this.createdUsers = {};
    this.createdHealthProfiles = {};
    this.createdCampaigns = {};
    this.createdCampaignResults = {};
  }

  async seedAll() {
    try {
      console.log("🌱 Starting sample data seeding...");
      
      // Clear existing data (except admin)
      await this.clearExistingData();
      
      // Seed in order of dependencies
      await this.seedUsers();
      await this.seedStudentParentRelations();
      await this.seedHealthProfiles();
      await this.seedCampaigns();
      await this.seedCampaignConsents();
      await this.seedCampaignResults();
      await this.seedMedicalEvents();
      await this.seedMedicineRequests();
      await this.seedConsultationSchedules();
      
      console.log("✅ Sample data seeding completed successfully!");
      
    } catch (error) {
      console.error("❌ Error seeding sample data:", error);
      throw error;
    }
  }

  async clearExistingData() {
    console.log("🧹 Clearing existing sample data...");
    
    // Don't delete admin user
    await User.deleteMany({ role: { $ne: "admin" } });
    await HealthProfile.deleteMany({});
    await Campaign.deleteMany({});
    await CampaignConsent.deleteMany({});
    await CampaignResult.deleteMany({});
    await ConsultationSchedule.deleteMany({});
    await StudentParent.deleteMany({});
    await MedicalEvent.deleteMany({});
    await MedicineRequest.deleteMany({});
    
    console.log("✅ Existing data cleared");
  }

  async seedUsers() {
    console.log("👥 Creating sample users...");
    
    const salt = await bcrypt.genSalt(10);
    
    // Medical Staff
    const nurse1 = new User({
      username: "nurse_nguyen",
      password: await bcrypt.hash("nurse123", salt),
      first_name: "Thị Lan",
      last_name: "Nguyễn",
      email: "nurse.nguyen@school.edu.vn",
      phone_number: "0901234567",
      gender: "female",
      dateOfBirth: new Date("1985-03-15"),
      role: "medicalStaff",
      staff_role: "Nurse",
      address: {
        street: "123 Đường Lê Lợi",
        city: "Hồ Chí Minh",
        state: "Hồ Chí Minh",
        postal_code: "70000",
        country: "Vietnam"
      },
      is_active: true
    });
    await nurse1.save();
    this.createdUsers.nurse1 = nurse1;

    const doctor1 = new User({
      username: "doctor_tran",
      password: await bcrypt.hash("doctor123", salt),
      first_name: "Văn Minh",
      last_name: "Trần",
      email: "doctor.tran@school.edu.vn",
      phone_number: "0902345678",
      gender: "male",
      dateOfBirth: new Date("1978-08-20"),
      role: "medicalStaff",
      staff_role: "Doctor",
      address: {
        street: "456 Đường Nguyễn Huệ",
        city: "Hồ Chí Minh",
        state: "Hồ Chí Minh",
        postal_code: "70000",
        country: "Vietnam"
      },
      is_active: true
    });
    await doctor1.save();
    this.createdUsers.doctor1 = doctor1;

    // Parents
    const parent1 = new User({
      username: "parent_le",
      password: await bcrypt.hash("parent123", salt),
      first_name: "Thị Mai",
      last_name: "Lê",
      email: "mai.le@email.com",
      phone_number: "0903456789",
      gender: "female",
      dateOfBirth: new Date("1980-05-10"),
      role: "parent",
      address: {
        street: "789 Đường Pasteur",
        city: "Hồ Chí Minh",
        state: "Hồ Chí Minh",
        postal_code: "70000",
        country: "Vietnam"
      },
      is_active: true
    });
    await parent1.save();
    this.createdUsers.parent1 = parent1;

    const parent2 = new User({
      username: "parent_pham",
      password: await bcrypt.hash("parent123", salt),
      first_name: "Văn Hùng",
      last_name: "Phạm",
      email: "hung.pham@email.com",
      phone_number: "0904567890",
      gender: "male",
      dateOfBirth: new Date("1975-12-03"),
      role: "parent",
      address: {
        street: "321 Đường Võ Văn Tần",
        city: "Hồ Chí Minh",
        state: "Hồ Chí Minh",
        postal_code: "70000",
        country: "Vietnam"
      },
      is_active: true
    });
    await parent2.save();
    this.createdUsers.parent2 = parent2;

    const parent3 = new User({
      username: "parent_linh",
      password: await bcrypt.hash("parent123", salt),
      first_name: "Thị Hoa",
      last_name: "Võ",
      gender: "female",
      email: "hoa.vo@email.com",
      phone_number: "0905678901",
      dateOfBirth: new Date("1980-08-15"),
      role: "parent",
      address: {
        street: "654 Đường Điện Biên Phủ",
        city: "Hồ Chí Minh",
        state: "Hồ Chí Minh",
        postal_code: "70000",
        country: "Vietnam"
      },
      is_active: true
    });
    await parent3.save();
    this.createdUsers.parent3 = parent3;

    // Students
    const student1 = new User({
      username: "student_an",
      password: await bcrypt.hash("student123", salt),
      first_name: "Thanh An",
      last_name: "Lê",
      gender: "female",
      dateOfBirth: new Date("2008-03-15"),
      role: "student",
      class_name: "10A1",
      student_id: "SE1701",
      address: {
        street: "789 Đường Pasteur",
        city: "Hồ Chí Minh",
        state: "Hồ Chí Minh",
        postal_code: "70000",
        country: "Vietnam"
      },
      is_active: true
    });
    await student1.save();
    this.createdUsers.student1 = student1;

    const student2 = new User({
      username: "student_duc",
      password: await bcrypt.hash("student123", salt),
      first_name: "Minh Đức",
      last_name: "Phạm",
      gender: "male",
      dateOfBirth: new Date("2007-09-22"),
      role: "student",
      class_name: "11B2",
      student_id: "SE1702",
      address: {
        street: "321 Đường Võ Văn Tần",
        city: "Hồ Chí Minh",
        state: "Hồ Chí Minh",
        postal_code: "70000",
        country: "Vietnam"
      },
      is_active: true
    });
    await student2.save();
    this.createdUsers.student2 = student2;

    const student3 = new User({
      username: "student_linh",
      password: await bcrypt.hash("student123", salt),
      first_name: "Hương Linh",
      last_name: "Võ",
      gender: "female",
      dateOfBirth: new Date("2008-07-08"),
      role: "student",
      class_name: "10A1",
      student_id: "SE1703",
      address: {
        street: "654 Đường Điện Biên Phủ",
        city: "Hồ Chí Minh",
        state: "Hồ Chí Minh",
        postal_code: "70000",
        country: "Vietnam"
      },
      is_active: true
    });
    await student3.save();
    this.createdUsers.student3 = student3;

    console.log("✅ Users created successfully");
  }

  async seedStudentParentRelations() {
    console.log("👨‍👩‍👧‍👦 Creating student-parent relations...");

    const relation1 = new StudentParent({
      student: this.createdUsers.student1._id,
      parent: this.createdUsers.parent1._id,
      relationship: "Mother",
      is_emergency_contact: true,
      status: "approved",
      created_by: this.createdUsers.parent1._id,
      admin_notes: "Verified relationship through school records",
      processed_at: new Date()
    });
    await relation1.save();

    const relation2 = new StudentParent({
      student: this.createdUsers.student2._id,
      parent: this.createdUsers.parent2._id,
      relationship: "Father",
      is_emergency_contact: true,
      status: "approved",
      created_by: this.createdUsers.parent2._id,
      admin_notes: "Verified relationship through school records",
      processed_at: new Date()
    });
    await relation2.save();

    const relation3 = new StudentParent({
      student: this.createdUsers.student3._id,
      parent: this.createdUsers.parent3._id,
      relationship: "Mother",
      is_emergency_contact: true,
      status: "approved",
      created_by: this.createdUsers.parent3._id,
      admin_notes: "Verified relationship through school records",
      processed_at: new Date()
    });
    await relation3.save();

    console.log("✅ Student-parent relations created");
  }

  async seedHealthProfiles() {
    console.log("🏥 Creating health profiles...");

    const healthProfile1 = new HealthProfile({
      student: this.createdUsers.student1._id,
      allergies: [
        {
          name: "Tôm cua",
          severity: ALLERGY_SEVERITY.MODERATE,
          notes: "Có phản ứng nổi mề đay khi ăn hải sản"
        }
      ],
      chronicDiseases: [],
      vision: {
        leftEye: 1.0,
        rightEye: 0.8,
        needsGlasses: false,
        lastCheckDate: new Date("2024-01-15")
      },
      hearing: {
        status: "normal",
        notes: "Thính giác bình thường"
      },
      height: 155,
      weight: 45,
      bloodPressure: {
        systolic: 110,
        diastolic: 70,
        recordedAt: new Date("2024-06-01")
      },
      heartRate: 72,
      bloodType: "A",
      emergencyContact: {
        name: "Lê Thị Mai",
        relationship: "Mother",
        phoneNumber: "0903456789"
      },
      immunizationRecord: [
        {
          vaccineName: "COVID-19",
          administeredDate: new Date("2023-09-15"),
          nextDueDate: new Date("2024-09-15"),
          administeredBy: this.createdUsers.nurse1._id,
          batchNumber: "CV001234",
          notes: "Pfizer vaccine, no adverse reactions"
        }
      ],
      lastUpdated: new Date()
    });
    await healthProfile1.save();
    this.createdHealthProfiles.student1 = healthProfile1;

    const healthProfile2 = new HealthProfile({
      student: this.createdUsers.student2._id,
      allergies: [],
      chronicDiseases: [
        {
          name: "Hen suyễn nhẹ",
          diagnosedDate: new Date("2020-03-10"),
          status: CHRONIC_DISEASE_STATUS.ACTIVE,
          notes: "Cần tránh vận động mạnh, luôn mang theo thuốc xịt"
        }
      ],
      vision: {
        leftEye: 0.6,
        rightEye: 0.7,
        needsGlasses: true,
        lastCheckDate: new Date("2024-02-20")
      },
      hearing: {
        status: "normal"
      },
      height: 165,
      weight: 58,
      bloodPressure: {
        systolic: 115,
        diastolic: 75,
        recordedAt: new Date("2024-06-01")
      },
      heartRate: 78,
      bloodType: "O",
      emergencyContact: {
        name: "Phạm Văn Hùng",
        relationship: "Father",
        phoneNumber: "0904567890"
      },
      immunizationRecord: [
        {
          vaccineName: "HPV",
          administeredDate: new Date("2023-10-20"),
          administeredBy: this.createdUsers.nurse1._id,
          batchNumber: "HPV987654",
          notes: "First dose of HPV vaccine series"
        }
      ],
      lastUpdated: new Date()
    });
    await healthProfile2.save();
    this.createdHealthProfiles.student2 = healthProfile2;

    const healthProfile3 = new HealthProfile({
      student: this.createdUsers.student3._id,
      allergies: [],
      chronicDiseases: [],
      vision: {
        leftEye: 1.0,
        rightEye: 1.0,
        needsGlasses: false,
        lastCheckDate: new Date("2024-01-10")
      },
      hearing: {
        status: "normal",
        notes: "Thính giác bình thường"
      },
      height: 150,
      weight: 40,
      bloodPressure: {
        systolic: 108,
        diastolic: 68,
        recordedAt: new Date("2024-06-01")
      },
      heartRate: 70,
      bloodType: "B",
      emergencyContact: {
        name: "Võ Thị Hoa",
        relationship: "Mother",
        phoneNumber: "0905678901"
      },
      immunizationRecord: [
        {
          vaccineName: "COVID-19",
          administeredDate: new Date("2023-09-20"),
          nextDueDate: new Date("2024-09-20"),
          administeredBy: this.createdUsers.nurse1._id,
          batchNumber: "CV001235",
          notes: "Pfizer vaccine, no adverse reactions"
        }
      ],
      lastUpdated: new Date()
    });
    await healthProfile3.save();
    this.createdHealthProfiles.student3 = healthProfile3;

    console.log("✅ Health profiles created");
  }

  async seedCampaigns() {
    console.log("📋 Creating health campaigns...");

    const vaccinationCampaign = new Campaign({
      title: "Chiến dịch tiêm chủng COVID-19 năm học 2024-2025",
      campaign_type: "vaccination",
      type: CAMPAIGN_TYPE.VACCINATION,
      vaccineDetails: {
        brand: "Pfizer-BioNTech",
        batchNumber: "PF2024001",
        dosage: "0.5ml"
      },
      description: "Chiến dịch tiêm chủng COVID-19 cho học sinh toàn trường nhằm bảo vệ sức khỏe cộng đồng",
      target_classes: ["10A1", "10A2", "11B1", "11B2", "12C1"],
      start_date: new Date("2024-09-01"),
      end_date: new Date("2024-09-30"),
      date: new Date("2024-09-01"), // Main campaign date
      status: "active",
      created_by: this.createdUsers.nurse1._id,
      requires_consent: true,
      consent_deadline: new Date("2024-08-25"),
      instructions: "Học sinh cần mang theo thẻ BHYT và đã ăn sáng"
    });
    await vaccinationCampaign.save();
    this.createdCampaigns.vaccination = vaccinationCampaign;

    const healthCheckCampaign = new Campaign({
      title: "Khám sức khỏe định kỳ học kỳ 1",
      campaign_type: "health_check",
      type: CAMPAIGN_TYPE.CHECKUP,
      description: "Khám sức khỏe tổng quát cho học sinh đầu năm học",
      target_classes: ["10A1", "11B2"],
      start_date: new Date("2024-08-15"),
      end_date: new Date("2024-08-30"),
      date: new Date("2024-08-15"), // Main campaign date
      status: "active",
      created_by: this.createdUsers.doctor1._id,
      requires_consent: false,
      instructions: "Học sinh đến khám theo lịch đã được thông báo"
    });
    await healthCheckCampaign.save();
    this.createdCampaigns.healthCheck = healthCheckCampaign;

    console.log("✅ Campaigns created");
  }

  async seedCampaignConsents() {
    console.log("✅ Creating campaign consents...");

    const consent1 = new CampaignConsent({
      campaign: this.createdCampaigns.vaccination._id,
      student: this.createdUsers.student1._id,
      answered_by: this.createdUsers.parent1._id,
      status: "Approved"
    });
    await consent1.save();

    const consent2 = new CampaignConsent({
      campaign: this.createdCampaigns.vaccination._id,
      student: this.createdUsers.student2._id,
      answered_by: this.createdUsers.parent2._id,
      status: "Declined"
    });
    await consent2.save();

    console.log("✅ Campaign consents created");
  }

  async seedCampaignResults() {
    console.log("📊 Creating campaign results...");

    const result1 = new CampaignResult({
      campaign: this.createdCampaigns.healthCheck._id,
      created_by: this.createdUsers.nurse1._id,
      student: this.createdUsers.student1._id,
      notes: "Khám sức khỏe định kỳ đầu năm học",
      checkupDetails: {
        findings: "Sức khỏe tốt, chỉ số phát triển bình thường",
        recommendations: "Duy trì chế độ ăn uống và tập thể dục",
        status: "HEALTHY",
        requiresConsultation: false
      }
    });
    await result1.save();
    this.createdCampaignResults = { result1 };

    const result2 = new CampaignResult({
      campaign: this.createdCampaigns.healthCheck._id,
      created_by: this.createdUsers.nurse1._id,
      student: this.createdUsers.student2._id,
      notes: "Phát hiện triệu chứng hen suyễn nhẹ",
      checkupDetails: {
        findings: "Có triệu chứng hen suyễn, cần theo dõi",
        recommendations: "Tránh các tác nhân gây dị ứng, có thuốc cấp cứu",
        status: "NEEDS_ATTENTION",
        requiresConsultation: true
      }
    });
    await result2.save();
    this.createdCampaignResults.result2 = result2;

    const result3 = new CampaignResult({
      campaign: this.createdCampaigns.vaccination._id,
      created_by: this.createdUsers.nurse1._id,
      student: this.createdUsers.student3._id,
      notes: "Tiêm chủng vaccine COVID-19 hoàn thành",
      checkupDetails: {
        findings: "Đã tiêm vaccine, không có phản ứng phụ",
        recommendations: "Theo dõi 15 phút sau tiêm, không có vấn đề",
        status: "HEALTHY",
        requiresConsultation: false
      }
    });
    await result3.save();
    this.createdCampaignResults.result3 = result3;

    console.log("✅ Campaign results created");
  }

  async seedMedicalEvents() {
    console.log("🏥 Creating medical events...");

    const medicalEvent1 = new MedicalEvent({
      student: this.createdUsers.student1._id,
      created_by: this.createdUsers.nurse1._id,
      event_type: EVENT_TYPE.FEVER,
      description: "Học sinh bị sốt nhẹ, chảy nước mũi",
      severity: EVENT_SEVERITY.LOW,
      symptoms: ["Sốt nhẹ 37.5°C", "Chảy nước mũi", "Ho khan"],
      treatment_notes: "Cho uống paracetamol, nghỉ ngơi",
      occurred_at: new Date("2024-06-10"),
      status: EVENT_STATUS.RESOLVED,
      resolved_at: new Date("2024-06-12"),
      medications_administered: [{
        name: "Paracetamol",
        dosage: "500mg",
        time: new Date("2024-06-10T10:00:00Z"),
        administered_by: this.createdUsers.nurse1._id
      }]
    });
    await medicalEvent1.save();

    const medicalEvent2 = new MedicalEvent({
      student: this.createdUsers.student2._id,
      created_by: this.createdUsers.nurse1._id,
      event_type: EVENT_TYPE.INJURY,
      description: "Học sinh bị ngã khi chơi thể thao, trầy xước đầu gối phải",
      severity: EVENT_SEVERITY.LOW,
      symptoms: ["Vết trầy 3cm ở đầu gối", "Chảy máu nhẹ"],
      treatment_notes: "Rửa vết thương, băng bó",
      occurred_at: new Date("2024-06-15"),
      status: EVENT_STATUS.RESOLVED,
      resolved_at: new Date("2024-06-15")
    });
    await medicalEvent2.save();

    const medicalEvent3 = new MedicalEvent({
      student: this.createdUsers.student3._id,
      created_by: this.createdUsers.doctor1._id,
      event_type: EVENT_TYPE.OTHER,
      description: "Học sinh có triệu chứng hen suyễn trong giờ thể dục",
      severity: EVENT_SEVERITY.MEDIUM,
      symptoms: ["Khó thở", "Thở khò khè", "Mệt mỏi"],
      treatment_notes: "Sử dụng thuốc xịt Ventolin, nghỉ ngơi",
      occurred_at: new Date("2024-07-20"),
      status: EVENT_STATUS.IN_PROGRESS,
      medications_administered: [{
        name: "Ventolin Inhaler",
        dosage: "2 puffs",
        time: new Date("2024-07-20T14:30:00Z"),
        administered_by: this.createdUsers.nurse1._id
      }]
    });
    await medicalEvent3.save();

    console.log("✅ Medical events created");
  }

  async seedMedicineRequests() {
    console.log("💊 Creating medicine requests...");

    // Create future dates for medicine requests
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 1); // Tomorrow
    const futureEndDate1 = new Date();
    futureEndDate1.setFullYear(futureEndDate1.getFullYear() + 1); // Next year

    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 2); // Day after tomorrow
    const futureEndDate2 = new Date();
    futureEndDate2.setMonth(futureEndDate2.getMonth() + 6); // 6 months from now

    const futureDate3 = new Date();
    futureDate3.setDate(futureDate3.getDate() + 3); // 3 days from now
    const futureEndDate3 = new Date();
    futureEndDate3.setMonth(futureEndDate3.getMonth() + 10); // 10 months from now

    const medicineRequest1 = new MedicineRequest({
      student: this.createdUsers.student2._id,
      created_by: this.createdUsers.parent2._id,
      startDate: futureDate1,
      endDate: futureEndDate1,
      medicines: [{
        name: "Ventolin Inhaler",
        dosage: "2 puffs",
        frequency: "Khi cần thiết (không quá 4 lần/ngày)",
        notes: "Thuốc cấp cứu cho hen suyễn"
      }]
    });
    await medicineRequest1.save();

    const medicineRequest2 = new MedicineRequest({
      student: this.createdUsers.student1._id,
      created_by: this.createdUsers.parent1._id,
      startDate: futureDate2,
      endDate: futureEndDate2,
      medicines: [{
        name: "Paracetamol 500mg",
        dosage: "1 viên",
        frequency: "Khi sốt trên 38°C (tối đa 3 lần/ngày)",
        notes: "Hạ sốt khi bị cảm lạnh"
      }]
    });
    await medicineRequest2.save();

    const medicineRequest3 = new MedicineRequest({
      student: this.createdUsers.student3._id,
      created_by: this.createdUsers.parent1._id,
      startDate: futureDate3,
      endDate: futureEndDate3,
      medicines: [{
        name: "EpiPen Auto-injector",
        dosage: "0.3mg",
        frequency: "Chỉ khi phản ứng dị ứng nghiêm trọng",
        notes: "Thuốc cấp cứu cho dị ứng nghiêm trọng với đậu phộng"
      }, {
        name: "Cetirizine 10mg",
        dosage: "1 viên",
        frequency: "Hàng ngày vào buổi tối",
        notes: "Thuốc chống dị ứng dài hạn"
      }]
    });
    await medicineRequest3.save();

    console.log("✅ Medicine requests created");
  }

  async seedConsultationSchedules() {
    console.log("📅 Creating consultation schedules...");

    // Note: ConsultationSchedule requires CampaignResult and attending_parent
    // Only create for students who need consultation based on campaign results
    // Also, scheduledDate must be in the future

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now

    const consultation1 = new ConsultationSchedule({
      campaignResult: this.createdCampaignResults.result2._id,
      student: this.createdUsers.student2._id,
      medicalStaff: this.createdUsers.doctor1._id,
      attending_parent: this.createdUsers.parent2._id,
      scheduledDate: futureDate,
      duration: 30,
      reason: "Khám theo dõi hen suyễn",
      notes: "Tư vấn về việc quản lý hen suyễn và sử dụng thuốc",
      status: "Scheduled"
    });
    await consultation1.save();

    console.log("✅ Consultation schedules created");
  }
}

// Function to run the seeder
async function seedSampleData() {
  const seeder = new SampleDataSeeder();
  await seeder.seedAll();
}

module.exports = { SampleDataSeeder, seedSampleData };
