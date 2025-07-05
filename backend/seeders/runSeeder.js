#!/usr/bin/env node

/**
 * Sample Data Seeder Script
 * Run this script to populate the database with sample data for testing
 */

const mongoose = require("mongoose");
const { seedSampleData } = require("./sampleDataSeeder");

// Load environment variables
require("dotenv").config();

const mongoUrl = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/assigment-sdn";

async function runSeeder() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoUrl);
    console.log("✅ Connected to MongoDB");

    console.log("🌱 Starting sample data seeding...");
    await seedSampleData();

    console.log("🎉 Sample data seeding completed successfully!");
    console.log("\n📊 Sample accounts created:");
    console.log("👥 Users:");
    console.log("   • Admin: admin / admin");
    console.log("   • Nurse: nurse_nguyen / nurse123");
    console.log("   • Doctor: doctor_tran / doctor123");
    console.log("   • Parent 1: parent_le / parent123");
    console.log("   • Parent 2: parent_pham / parent123");
    console.log("   • Student 1: student_an / student123");
    console.log("   • Student 2: student_duc / student123");
    console.log("   • Student 3: student_linh / student123");
    
    console.log("\n🏥 Health data:");
    console.log("   • Health profiles for students");
    console.log("   • Medical events and treatments");
    console.log("   • Medicine requests");
    
    console.log("\n📋 Campaigns:");
    console.log("   • COVID-19 vaccination campaign");
    console.log("   • Health check campaign");
    console.log("   • Campaign consents and schedules");
    
    console.log("\n🔗 Relationships:");
    console.log("   • Student-parent relations");
    console.log("   • Consultation schedules");

  } catch (error) {
    console.error("❌ Error running seeder:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Run the seeder
runSeeder();
