const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const personSchema = require("../interfaces/person");

const medicalStaffSchema = new Schema(
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
  },
  {
    timestamps: true,
  }
);

const MedicalStaff = mongoose.model("MedicalStaff", medicalStaffSchema);

module.exports = MedicalStaff;
