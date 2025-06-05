const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const medicalEventSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "MedicalStaff",
      required: true,
    },
    event: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MedicalEvent = mongoose.model("MedicalEvent", medicalEventSchema);

module.exports = MedicalEvent;
