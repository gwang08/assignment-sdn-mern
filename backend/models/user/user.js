const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const personSchema = require("../interfaces/person");

const userSchema = new Schema(
  {
    ...personSchema.obj,

    // Common fields for all users
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows null for students who might not have email
      trim: true,
    },
    phone_number: {
      type: String,
      sparse: true, // Optional for students
      trim: true,
    },

    // Role field to determine user type
    role: {
      type: String,
      required: true,
      enum: ["parent", "student", "medicalStaff", "admin"],
    },

    // Student-specific fields
    class_name: {
      type: String,
      required: function () {
        return this.role === "student";
      },
    },

    // Medical staff-specific fields
    staff_role: {
      type: String,
      enum: ["Nurse", "Doctor", "Healthcare Assistant"],
      required: function () {
        return this.role === "medicalStaff";
      },
    },

    // Admin has no special fields, all admins have the same permissions
    // (All admin functionality is controlled by the 'role' field being set to 'admin')

    // Common status fields
    is_active: {
      type: Boolean,
      default: true,
    },
    last_login: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Validation middleware to ensure required fields based on role
userSchema.pre("validate", function (next) {
  if (this.role === "parent") {
    if (!this.email) {
      this.invalidate("email", "Email is required for parents");
    }
    if (!this.phone_number) {
      this.invalidate("phone_number", "Phone number is required for parents");
    }
  }

  if (this.role === "medicalStaff") {
    if (!this.email) {
      this.invalidate("email", "Email is required for medical staff");
    }
    if (!this.phone_number) {
      this.invalidate(
        "phone_number",
        "Phone number is required for medical staff"
      );
    }
  }

  if (this.role === "admin") {
    if (!this.email) {
      this.invalidate("email", "Email is required for admins");
    }
    if (!this.phone_number) {
      this.invalidate("phone_number", "Phone number is required for admins");
    }
  }

  next();
});

// Virtual to get display name based on role
userSchema.virtual("displayRole").get(function () {
  switch (this.role) {
    case "parent":
      return "Parent";
    case "student":
      return "Student";
    case "medicalStaff":
      return this.staff_role || "Medical Staff";
    case "admin":
      return "Admin";
    default:
      return "User";
  }
});

// Method to check if user has specific permission
userSchema.methods.hasPermission = function (permission) {
  // All admins have all permissions
  return this.role === "admin";
};

// Method to get role-specific data
userSchema.methods.getRoleData = function () {
  const baseData = {
    _id: this._id,
    username: this.username,
    first_name: this.first_name,
    last_name: this.last_name,
    gender: this.gender,
    dateOfBirth: this.dateOfBirth,
    address: this.address,
    role: this.role,
    is_active: this.is_active,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };

  switch (this.role) {
    case "parent":
      return {
        ...baseData,
        email: this.email,
        phone_number: this.phone_number,
      };

    case "student":
      return {
        ...baseData,
        class_name: this.class_name,
      };

    case "medicalStaff":
      return {
        ...baseData,
        email: this.email,
        phone_number: this.phone_number,
        staff_role: this.staff_role,
      };

    case "admin":
      return {
        ...baseData,
        email: this.email,
        phone_number: this.phone_number,
      };

    default:
      return baseData;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
