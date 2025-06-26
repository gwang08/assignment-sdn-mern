const mongoose = require('mongoose');
const MedicineRequest = require('./models/medicineRequest');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/assigment-sdn12', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedMedicineRequests = async () => {
  try {
    // Clear existing medicine requests
    await MedicineRequest.deleteMany({});

    // Create sample medicine requests for our parent and students
    const medicineRequests = [
      {
        student: new mongoose.Types.ObjectId('685c2633f5b6c16e86b1b26a'),
        requestedBy: new mongoose.Types.ObjectId('685c226dbfd3a2ccf6e98951'), // parent
        medicine_name: 'Paracetamol',
        dosage: '500mg',
        frequency: '2 lần/ngày',
        duration: '7 ngày',
        start_date: new Date('2025-07-01'),
        end_date: new Date('2025-07-07'),
        instructions: 'Uống sau bữa ăn, khi có sốt hoặc đau đầu',
        notes: 'Con em có triệu chứng sốt nhẹ',
        status: 'pending',
        createdAt: new Date('2025-06-26T08:00:00.000Z')
      },
      {
        student: new mongoose.Types.ObjectId('685c2633f5b6c16e86b1b26d'),
        requestedBy: new mongoose.Types.ObjectId('685c226dbfd3a2ccf6e98951'), // parent
        medicine_name: 'Salbutamol Inhaler',
        dosage: '100mcg/puff',
        frequency: '2 puff khi cần',
        duration: '30 ngày',
        start_date: new Date('2025-07-02'),
        end_date: new Date('2025-08-01'),
        instructions: 'Sử dụng khi khó thở, lắc đều trước khi dùng',
        notes: 'Con em có tiền sử hen suyễn',
        status: 'approved',
        approved_by: 'Y tá Nguyễn Thị B',
        approved_at: new Date('2025-06-26T09:30:00.000Z'),
        createdAt: new Date('2025-06-25T14:00:00.000Z')
      },
      {
        student: new mongoose.Types.ObjectId('685c2633f5b6c16e86b1b26a'),
        requestedBy: new mongoose.Types.ObjectId('685c226dbfd3a2ccf6e98951'), // parent
        medicine_name: 'Vitamin D3',
        dosage: '1000 IU',
        frequency: '1 lần/ngày',
        duration: '30 ngày',
        start_date: new Date('2025-06-20'),
        end_date: new Date('2025-07-20'),
        instructions: 'Uống vào buổi sáng sau bữa ăn',
        notes: 'Bổ sung vitamin D theo chỉ định bác sĩ',
        status: 'completed',
        approved_by: 'Bác sĩ Trần Văn C',
        approved_at: new Date('2025-06-20T10:00:00.000Z'),
        createdAt: new Date('2025-06-19T16:00:00.000Z')
      },
      {
        student: new mongoose.Types.ObjectId('685c2633f5b6c16e86b1b26d'),
        requestedBy: new mongoose.Types.ObjectId('685c226dbfd3a2ccf6e98951'), // parent
        medicine_name: 'Amoxicillin',
        dosage: '250mg',
        frequency: '3 lần/ngày',
        duration: '7 ngày',
        start_date: new Date('2025-06-15'),
        end_date: new Date('2025-06-22'),
        instructions: 'Uống đúng giờ, không bỏ liều',
        notes: 'Điều trị viêm họng',
        status: 'rejected',
        rejection_reason: 'Cần có đơn thuốc của bác sĩ',
        createdAt: new Date('2025-06-14T11:30:00.000Z')
      },
      {
        student: new mongoose.Types.ObjectId('685c2633f5b6c16e86b1b26a'),
        requestedBy: new mongoose.Types.ObjectId('685c226dbfd3a2ccf6e98951'), // parent
        medicine_name: 'Cetirizine',
        dosage: '10mg',
        frequency: '1 lần/ngày tối',
        duration: '14 ngày',
        start_date: new Date('2025-07-05'),
        end_date: new Date('2025-07-19'),
        instructions: 'Uống vào buổi tối trước khi ngủ',
        notes: 'Điều trị dị ứng da',
        status: 'pending',
        createdAt: new Date('2025-06-26T10:30:00.000Z')
      }
    ];

    // Insert medicine requests
    const insertedRequests = await MedicineRequest.insertMany(medicineRequests);
    
    console.log('✅ Medicine requests seeded successfully!');
    console.log(`Created ${insertedRequests.length} medicine requests`);
    
    // Print sample data structure for frontend reference
    console.log('\n📄 Sample medicine request data structure for frontend:');
    console.log(JSON.stringify({
      _id: "example_id",
      student: "685c2633f5b6c16e86b1b26a",
      requestedBy: "685c226dbfd3a2ccf6e98951",
      medicine_name: "Paracetamol",
      dosage: "500mg",
      frequency: "2 lần/ngày",
      duration: "7 ngày",
      start_date: "2025-07-01",
      end_date: "2025-07-07",
      instructions: "Uống sau bữa ăn, khi có sốt hoặc đau đầu",
      notes: "Con em có triệu chứng sốt nhẹ",
      status: "pending",
      createdAt: "2025-06-26T08:00:00.000Z"
    }, null, 2));

  } catch (error) {
    console.error('❌ Error seeding medicine requests:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeder
seedMedicineRequests();
