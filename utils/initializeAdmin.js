const bcrypt = require("bcryptjs");
const Admin = require("../models/user/admin");

async function initializeAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: "admin_manager" });
    if (existingAdmin) {
      console.log("✅ Admin manager already exists");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("AdminManager2025!", salt);

    const adminManager = new Admin({
      username: "admin_manager",
      password: hashedPassword,
      first_name: "Admin",
      last_name: "Manager",
      email: "admin.manager@school.edu",
      phone_number: "123-456-7890",
      gender: "other",
      dateOfBirth: new Date("1990-01-01"),
      role: "student_manager",
      permissions: {
        create_student: true,
        manage_student_parent: true,
        create_staff: true,
        manage_system: false,
      },
    });

    await adminManager.save();
    console.log("✅ Admin manager created successfully");
  } catch (error) {
    console.error("❌ Error creating admin manager:", error);
  }
}

module.exports = initializeAdmin;
