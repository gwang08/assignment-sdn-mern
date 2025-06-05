const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const personSchema = require("../interfaces/person");

const medicalStaffSchema = new Schema(
  {
    ...personSchema.obj,
    phone_number: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["Nurse", "Doctor", "Healthcare Assistant"],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const MedicalStaff = mongoose.model("MedicalStaff", medicalStaffSchema);

module.exports = MedicalStaff;
