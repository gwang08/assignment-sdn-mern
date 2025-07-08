const mongoose = require('mongoose');
const Campaign = require('./models/campaign/campaign');
const User = require('./models/user/user');
const StudentParent = require('./models/user/studentParent');

async function checkCampaigns() {
  try {
    await mongoose.connect('mongodb://localhost:27017/health_management');
    
    console.log('=== ALL CAMPAIGNS ===');
    const campaigns = await Campaign.find({});
    campaigns.forEach(campaign => {
      console.log(`ID: ${campaign._id}`);
      console.log(`Title: ${campaign.title}`);
      console.log(`Status: ${campaign.status}`);
      console.log(`Target Classes: ${JSON.stringify(campaign.target_classes)}`);
      console.log(`Target Students: ${JSON.stringify(campaign.target_students)}`);
      console.log('---');
    });

    console.log('\n=== SAMPLE STUDENTS ===');
    const students = await User.find({ role: 'student' }).limit(5);
    students.forEach(student => {
      console.log(`Student ID: ${student._id}`);
      console.log(`Name: ${student.first_name} ${student.last_name}`);
      console.log(`Class: ${student.class_name}`);
      console.log('---');
    });

    console.log('\n=== SAMPLE PARENT-STUDENT RELATIONS ===');
    const relations = await StudentParent.find({ status: 'approved', is_active: true })
      .populate('parent', 'first_name last_name')
      .populate('student', 'first_name last_name class_name')
      .limit(5);
    
    relations.forEach(relation => {
      console.log(`Parent: ${relation.parent.first_name} ${relation.parent.last_name}`);
      console.log(`Student: ${relation.student.first_name} ${relation.student.last_name}`);
      console.log(`Student Class: ${relation.student.class_name}`);
      console.log('---');
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCampaigns();