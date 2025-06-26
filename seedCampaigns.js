const mongoose = require('mongoose');
const Campaign = require('./models/campaign/campaign');
const { CAMPAIGN_TYPE } = require('./utils/enums');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/assigment-sdn12', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedCampaigns = async () => {
  try {
    // Clear existing campaigns
    await Campaign.deleteMany({});

    // Create sample campaigns
    const campaigns = [
      {
        title: 'Chiến dịch tiêm vaccine HPV 2025',
        type: CAMPAIGN_TYPE.VACCINATION,
        description: 'Chương trình tiêm vaccine HPV miễn phí cho học sinh lớp 6',
        date: new Date('2025-07-01'),
        vaccineDetails: {
          brand: 'Gardasil 9',
          batchNumber: 'HPV2025-001',
          dosage: '0.5ml'
        }
      },
      {
        title: 'Kiểm tra sức khỏe định kỳ học kỳ 2',
        type: CAMPAIGN_TYPE.CHECKUP,
        description: 'Chương trình kiểm tra sức khỏe định kỳ cho tất cả học sinh',
        date: new Date('2025-08-01')
      },
      {
        title: 'Chiến dịch tiêm vaccine cúm mùa',
        type: CAMPAIGN_TYPE.VACCINATION,
        description: 'Chương trình tiêm vaccine cúm mùa cho học sinh',
        date: new Date('2025-09-01'),
        vaccineDetails: {
          brand: 'Influvac',
          batchNumber: 'FLU2025-002',
          dosage: '0.5ml'
        }
      },
      {
        title: 'Khám mắt định kỳ',
        type: CAMPAIGN_TYPE.CHECKUP,
        description: 'Kiểm tra thị lực và phát hiện sớm các vấn đề về mắt',
        date: new Date('2025-09-15')
      },
      {
        title: 'Tư vấn sức khỏe tâm thần học sinh',
        type: CAMPAIGN_TYPE.CHECKUP,
        description: 'Chương trình tư vấn và hỗ trợ sức khỏe tâm thần cho học sinh',
        date: new Date('2025-07-15')
      }
    ];

    // Insert campaigns
    const insertedCampaigns = await Campaign.insertMany(campaigns);
    
    console.log('✅ Campaigns seeded successfully!');
    console.log(`Created ${insertedCampaigns.length} campaigns`);
    
    // Print sample data structure for frontend reference
    console.log('\n📄 Sample campaign data structure for frontend:');
    console.log(JSON.stringify({
      _id: "example_id",
      title: "Chiến dịch tiêm vaccine HPV 2025",
      type: "Vaccination",
      description: "Chương trình tiêm vaccine HPV miễn phí cho học sinh lớp 6",
      date: "2025-07-01",
      vaccineDetails: {
        brand: "Gardasil 9",
        batchNumber: "HPV2025-001",
        dosage: "0.5ml"
      },
      createdAt: "2025-06-26T10:00:00.000Z"
    }, null, 2));

  } catch (error) {
    console.error('❌ Error seeding campaigns:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeder
seedCampaigns();
