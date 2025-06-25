const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const personSchema = require("../interfaces/person");

const adminSchema = new Schema(
  {
    ...personSchema.obj,
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
      required: true,
      unique: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["super_admin", "student_manager"],
      default: "student_manager",
    },
    permissions: {
      create_student: {
        type: Boolean,
        default: true,
      },
      manage_student_parent: {
        type: Boolean,
        default: true,
      },
      create_staff: {
        type: Boolean,
        default: false,
      },
      manage_system: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
