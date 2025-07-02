const bcrypt = require("bcryptjs");
const User = require("../models/user/user");

async function initializeAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      username: "admin",
      role: "admin",
    });
    if (existingAdmin) {
      console.log("✅ Admin manager already exists");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin", salt);

    const adminManager = new User({
      username: "admin",
      password: hashedPassword,
      first_name: "Admin",
      last_name: "Manager",
      email: "admin.manager@school.edu",
      phone_number: "123-456-7890",
      gender: "other",
      dateOfBirth: new Date("1990-01-01"),
      role: "admin",
    });

    await adminManager.save();
    console.log("✅ Admin manager created successfully");
  } catch (error) {
    console.error("❌ Error creating admin manager:", error);
  }
}

module.exports = initializeAdmin;
