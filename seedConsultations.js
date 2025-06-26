const mongoose = require('mongoose');
const ConsultationSchedule = require('./models/campaign/consultationSchedule');
const { CONSULTATION_STATUS } = require('./utils/enums');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/assigment-sdn12', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedConsultations = async () => {
  try {
    // Clear existing consultations
    await ConsultationSchedule.deleteMany({});

    // Create some sample Campaign Results and Medical Staff IDs
    // In a real scenario, you would get these from the database
    const sampleCampaignResultId = new mongoose.Types.ObjectId();
    const sampleMedicalStaffId = new mongoose.Types.ObjectId();

    // Consultation data for the two students
    const consultations = [
      {
        // For student 685c2633f5b6c16e86b1b26a (father's child) - upcoming
        campaignResult: sampleCampaignResultId,
        student: new mongoose.Types.ObjectId('685c2633f5b6c16e86b1b26a'),
        medicalStaff: sampleMedicalStaffId,
        attending_parent: new mongoose.Types.ObjectId('685c226dbfd3a2ccf6e98951'),
        scheduledDate: new Date('2025-07-01T09:00:00.000Z'),
        duration: 30,
        reason: 'Kiểm tra thị lực định kỳ',
        status: CONSULTATION_STATUS.SCHEDULED,
        notes: 'Học sinh cần kiểm tra thị lực theo lịch định kỳ',
        notificationsSent: true,
      },
      {
        // For student 685c2633f5b6c16e86b1b26a (father's child) - completed
        campaignResult: sampleCampaignResultId,
        student: new mongoose.Types.ObjectId('685c2633f5b6c16e86b1b26a'),
        medicalStaff: sampleMedicalStaffId,
        attending_parent: new mongoose.Types.ObjectId('685c226dbfd3a2ccf6e98951'),
        scheduledDate: new Date('2025-06-20T14:00:00.000Z'),
        duration: 45,
        reason: 'Tư vấn dinh dưỡng',
        status: CONSULTATION_STATUS.COMPLETED,
        notes: 'Phụ huynh quan tâm đến chế độ ăn uống của con',
        notificationsSent: true,
      },
      {
        // For student 685c2633f5b6c16e86b1b26d (mother's child) - upcoming
        campaignResult: sampleCampaignResultId,
        student: new mongoose.Types.ObjectId('685c2633f5b6c16e86b1b26d'),
        medicalStaff: sampleMedicalStaffId,
        attending_parent: new mongoose.Types.ObjectId('685c226dbfd3a2ccf6e98951'),
        scheduledDate: new Date('2025-07-03T10:30:00.000Z'),
        duration: 30,
        reason: 'Theo dõi dị ứng thức ăn',
        status: CONSULTATION_STATUS.SCHEDULED,
        notes: 'Học sinh có biểu hiện dị ứng với một số thực phẩm',
        notificationsSent: true,
      },
      {
        // For student 685c2633f5b6c16e86b1b26d (mother's child) - cancelled
        campaignResult: sampleCampaignResultId,
        student: new mongoose.Types.ObjectId('685c2633f5b6c16e86b1b26d'),
        medicalStaff: sampleMedicalStaffId,
        attending_parent: new mongoose.Types.ObjectId('685c226dbfd3a2ccf6e98951'),
        scheduledDate: new Date('2025-06-18T11:00:00.000Z'),
        duration: 30,
        reason: 'Kiểm tra sức khỏe tổng quát',
        status: CONSULTATION_STATUS.CANCELLED,
        notes: 'Phụ huynh yêu cầu kiểm tra sức khỏe tổng quát cho con',
        cancelReason: 'Phụ huynh có việc đột xuất không thể tham gia',
        notificationsSent: true,
      },
      {
        // For student 685c2633f5b6c16e86b1b26a - future appointment
        campaignResult: sampleCampaignResultId,
        student: new mongoose.Types.ObjectId('685c2633f5b6c16e86b1b26a'),
        medicalStaff: sampleMedicalStaffId,
        attending_parent: new mongoose.Types.ObjectId('685c226dbfd3a2ccf6e98951'),
        scheduledDate: new Date('2025-07-10T15:30:00.000Z'),
        duration: 60,
        reason: 'Tư vấn tâm lý học đường',
        status: CONSULTATION_STATUS.SCHEDULED,
        notes: 'Phụ huynh muốn được tư vấn về tâm lý và hành vi của con tại trường',
        notificationsSent: false,
      }
    ];

    // Insert consultations (skipping validation for demo purposes)
    const insertPromises = consultations.map(async (consultation) => {
      try {
        return await ConsultationSchedule.create(consultation);
      } catch (error) {
        console.log(`Skipping consultation due to validation: ${error.message}`);
        // Create a simplified version without validation
        return await ConsultationSchedule.collection.insertOne(consultation);
      }
    });

    const results = await Promise.allSettled(insertPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    
    console.log('✅ Consultations seeded successfully!');
    console.log(`Created ${successful} consultations out of ${consultations.length} attempted`);
    
    // Print sample data structure for frontend reference
    console.log('\n📄 Sample data structure for frontend:');
    console.log(JSON.stringify({
      _id: "example_id",
      student_id: "685c2633f5b6c16e86b1b26a",
      parent_id: "685c226dbfd3a2ccf6e98951", 
      medical_staff_id: "sample_medical_staff_id",
      appointment_date: "2025-07-01",
      appointment_time: "09:00",
      reason: "Kiểm tra thị lực định kỳ",
      consultation_type: "in_person",
      status: "scheduled",
      notes: "Học sinh cần kiểm tra thị lực theo lịch định kỳ",
      createdAt: "2025-06-26T10:00:00.000Z"
    }, null, 2));

  } catch (error) {
    console.error('❌ Error seeding consultations:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeder
seedConsultations();
