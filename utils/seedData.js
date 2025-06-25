const bcrypt = require("bcryptjs");
const Admin = require("../models/user/admin");
const MedicalStaff = require("../models/user/medicalStaff");
const Parent = require("../models/user/parent");
const Student = require("../models/user/student");
const StudentParent = require("../models/user/studentParent");
const HealthProfile = require("../models/healthProfile");
const Campaign = require("../models/campaign/campaign");

async function seedData() {
  try {
    console.log("🌱 Starting data seeding...");

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await Admin.deleteMany({});
    // await MedicalStaff.deleteMany({});
    // await Parent.deleteMany({});
    // await Student.deleteMany({});

    const salt = await bcrypt.genSalt(10);

    // Create Admin users
    const adminUsers = [
      {
        username: "admin",
        password: await bcrypt.hash("admin123", salt),
        first_name: "Super",
        last_name: "Admin",
        email: "admin@school.edu",
        phone_number: "123-456-7890",
        gender: "other",
        dateOfBirth: new Date("1985-01-01"),
        role: "super_admin",
        permissions: {
          create_student: true,
          manage_student_parent: true,
          create_staff: true,
          manage_system: true,
        },
      },
      {
        username: "manager",
        password: await bcrypt.hash("manager123", salt),
        first_name: "Student",
        last_name: "Manager",
        email: "manager@school.edu",
        phone_number: "123-456-7891",
        gender: "female",
        dateOfBirth: new Date("1988-03-15"),
        role: "student_manager",
        permissions: {
          create_student: true,
          manage_student_parent: true,
          create_staff: false,
          manage_system: false,
        },
      }
    ];

    for (const adminData of adminUsers) {
      const existingAdmin = await Admin.findOne({ username: adminData.username });
      if (!existingAdmin) {
        const admin = new Admin(adminData);
        await admin.save();
        console.log(`✅ Admin ${adminData.username} created`);
      } else {
        console.log(`⚠️ Admin ${adminData.username} already exists`);
      }
    }

    // Create Medical Staff users
    const medicalStaffUsers = [
      {
        username: "nurse01",
        password: await bcrypt.hash("nurse123", salt),
        first_name: "Nguyễn",
        last_name: "Y Tá",
        email: "nurse01@school.edu",
        phone_number: "123-456-7892",
        gender: "female",
        dateOfBirth: new Date("1990-05-20"),
        role: "Nurse",
        specialization: "Pediatric Nursing",
        license_number: "RN123456",
        department: "School Health Services",
      },
      {
        username: "doctor01",
        password: await bcrypt.hash("doctor123", salt),
        first_name: "Trần",
        last_name: "Bác Sĩ",
        email: "doctor01@school.edu",
        phone_number: "123-456-7893",
        gender: "male",
        dateOfBirth: new Date("1985-08-10"),
        role: "Doctor",
        specialization: "General Practice",
        license_number: "MD789012",
        department: "School Health Services",
      },
      {
        username: "assistant01",
        password: await bcrypt.hash("assistant123", salt),
        first_name: "Lê",
        last_name: "Trợ Lý",
        email: "assistant01@school.edu",
        phone_number: "123-456-7894",
        gender: "female",
        dateOfBirth: new Date("1992-12-05"),
        role: "Healthcare Assistant",
        specialization: "Health Support",
        license_number: "HA345678",
        department: "School Health Services",
      }
    ];

    for (const staffData of medicalStaffUsers) {
      const existingStaff = await MedicalStaff.findOne({ username: staffData.username });
      if (!existingStaff) {
        const staff = new MedicalStaff(staffData);
        await staff.save();
        console.log(`✅ Medical Staff ${staffData.username} created`);
      } else {
        console.log(`⚠️ Medical Staff ${staffData.username} already exists`);
      }
    }

    // Create Parent users
    const parentUsers = [
      {
        username: "parent01",
        password: await bcrypt.hash("parent123", salt),
        first_name: "Nguyễn Văn",
        last_name: "Cha",
        email: "parent01@email.com",
        phone_number: "098-765-4321",
        gender: "male",
        dateOfBirth: new Date("1980-03-15"),
        role: "parent",
        address: "123 Đường ABC, Quận 1, TP.HCM",
        occupation: "Kỹ sư",
        emergency_contact: "098-765-4322",
      },
      {
        username: "parent02",
        password: await bcrypt.hash("parent123", salt),
        first_name: "Trần Thị",
        last_name: "Mẹ",
        email: "parent02@email.com",
        phone_number: "098-765-4323",
        gender: "female",
        dateOfBirth: new Date("1982-07-20"),
        role: "parent",
        address: "456 Đường XYZ, Quận 2, TP.HCM",
        occupation: "Giáo viên",
        emergency_contact: "098-765-4324",
      }
    ];

    const createdParents = [];
    for (const parentData of parentUsers) {
      const existingParent = await Parent.findOne({ username: parentData.username });
      if (!existingParent) {
        const parent = new Parent(parentData);
        await parent.save();
        createdParents.push(parent);
        console.log(`✅ Parent ${parentData.username} created`);
      } else {
        createdParents.push(existingParent);
        console.log(`⚠️ Parent ${parentData.username} already exists`);
      }
    }

    // Create Student users
    const studentUsers = [
      {
        username: "student01",
        password: await bcrypt.hash("student123", salt),
        first_name: "Nguyễn",
        last_name: "Học Sinh A",
        email: "student01@school.edu",
        phone_number: "098-111-2222",
        gender: "male",
        dateOfBirth: new Date("2015-04-10"),
        role: "student",
        student_id: "HS001",
        class_name: "Lớp 3A",
        grade_level: 3,
        school_year: "2024-2025",
        enrollment_date: new Date("2022-09-01"),
        status: "active",
      },
      {
        username: "student02",
        password: await bcrypt.hash("student123", salt),
        first_name: "Trần",
        last_name: "Học Sinh B",
        email: "student02@school.edu",
        phone_number: "098-111-2223",
        gender: "female",
        dateOfBirth: new Date("2014-08-15"),
        role: "student",
        student_id: "HS002",
        class_name: "Lớp 4B",
        grade_level: 4,
        school_year: "2024-2025",
        enrollment_date: new Date("2021-09-01"),
        status: "active",
      },
      {
        username: "student03",
        password: await bcrypt.hash("student123", salt),
        first_name: "Lê",
        last_name: "Học Sinh C",
        email: "student03@school.edu",
        phone_number: "098-111-2224",
        gender: "female",
        dateOfBirth: new Date("2016-02-28"),
        role: "student",
        student_id: "HS003",
        class_name: "Lớp 2C",
        grade_level: 2,
        school_year: "2024-2025",
        enrollment_date: new Date("2023-09-01"),
        status: "active",
      }
    ];

    const createdStudents = [];
    for (const studentData of studentUsers) {
      const existingStudent = await Student.findOne({ username: studentData.username });
      if (!existingStudent) {
        const student = new Student(studentData);
        await student.save();
        createdStudents.push(student);
        console.log(`✅ Student ${studentData.username} created`);
      } else {
        createdStudents.push(existingStudent);
        console.log(`⚠️ Student ${studentData.username} already exists`);
      }
    }

    // Create Student-Parent relationships
    const relationships = [
      { studentIndex: 0, parentIndex: 0, relationship: "father" },
      { studentIndex: 1, parentIndex: 1, relationship: "mother" },
      { studentIndex: 2, parentIndex: 0, relationship: "father" },
    ];

    for (const rel of relationships) {
      const existingRel = await StudentParent.findOne({
        student: createdStudents[rel.studentIndex]._id,
        parent: createdParents[rel.parentIndex]._id
      });

      if (!existingRel) {
        const studentParent = new StudentParent({
          student: createdStudents[rel.studentIndex]._id,
          parent: createdParents[rel.parentIndex]._id,
          relationship: rel.relationship,
          is_emergency_contact: true,
        });
        await studentParent.save();
        console.log(`✅ Relationship created: ${createdStudents[rel.studentIndex].first_name} - ${createdParents[rel.parentIndex].first_name}`);
      }
    }

    // Create Health Profiles for students
    for (const student of createdStudents) {
      const existingProfile = await HealthProfile.findOne({ student: student._id });
      if (!existingProfile) {
        const healthProfile = new HealthProfile({
          student: student._id,
          allergies: [
            {
              name: ["Không có", "Phấn hoa", "Đậu phộng"][Math.floor(Math.random() * 3)],
              severity: "Mild",
              notes: "Ghi chú về dị ứng"
            }
          ],
          chronicDiseases: [],
          treatmentHistory: [],
          vision: {
            leftEye: 1.0,
            rightEye: 1.0,
            notes: "Mắt bình thường"
          },
          hearing: {
            leftEar: "Normal",
            rightEar: "Normal",
            notes: "Tai bình thường"
          },
          notes: "Sức khỏe tốt",
        });
        await healthProfile.save();
        console.log(`✅ Health profile created for ${student.first_name}`);
      }
    }

    // Create sample campaigns
    const campaigns = [
      {
        title: "Chiến dịch Tiêm phòng Cúm mùa 2024",
        description: "Chiến dịch tiêm phòng cúm mùa cho học sinh toàn trường",
        type: "Vaccination",
        date: new Date("2024-10-01"),
        vaccineDetails: {
          brand: "Vắc xin cúm mùa",
          batchNumber: "FLU2024001",
          dosage: "0.5ml"
        }
      },
      {
        title: "Khám sức khỏe định kỳ 2024",
        description: "Khám sức khỏe định kỳ cho học sinh đầu năm học",
        type: "Checkup",
        date: new Date("2024-09-01"),
      }
    ];

    for (const campaignData of campaigns) {
      const existingCampaign = await Campaign.findOne({ title: campaignData.title });
      if (!existingCampaign) {
        const campaign = new Campaign(campaignData);
        await campaign.save();
        console.log(`✅ Campaign created: ${campaignData.title}`);
      } else {
        console.log(`⚠️ Campaign already exists: ${campaignData.title}`);
      }
    }

    console.log("\n🎉 Data seeding completed successfully!");
    console.log("\n📋 Created accounts:");
    console.log("Admin: admin/admin123");
    console.log("Manager: manager/manager123");
    console.log("Nurse: nurse01/nurse123");
    console.log("Doctor: doctor01/doctor123");
    console.log("Assistant: assistant01/assistant123");
    console.log("Parent 1: parent01/parent123");
    console.log("Parent 2: parent02/parent123");
    console.log("Student 1: student01/student123");
    console.log("Student 2: student02/student123");
    console.log("Student 3: student03/student123");

  } catch (error) {
    console.error("❌ Error seeding data:", error);
  }
}

module.exports = seedData;
