const mongoose = require("mongoose");
const {
  ALLERGY_SEVERITY,
  CHRONIC_DISEASE_STATUS,
  HEARING_STATUS,
} = require("../utils/enums");

const healthProfileSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    allergies: [
      {
        name: { type: String, required: true },
        severity: {
          type: String,
          enum: Object.values(ALLERGY_SEVERITY),
          required: true,
        },
        notes: String,
      },
    ],
    chronicDiseases: [
      {
        name: { type: String, required: true },
        diagnosedDate: Date,
        status: {
          type: String,
          enum: Object.values(CHRONIC_DISEASE_STATUS),
          default: CHRONIC_DISEASE_STATUS.ACTIVE,
        },
        notes: String,
      },
    ],
    treatmentHistory: [
      {
        condition: { type: String, required: true },
        treatmentDate: { type: Date, required: true },
        treatment: String,
        outcome: String,
      },
    ],
    vision: {
      leftEye: {
        type: Number,
        min: 0,
        max: 10.0,
        validate: {
          validator: Number.isFinite,
          message: "{VALUE} is not a valid vision measurement",
        },
      },
      rightEye: {
        type: Number,
        min: 0,
        max: 10.0,
        validate: {
          validator: Number.isFinite,
          message: "{VALUE} is not a valid vision measurement",
        },
      },
      lastCheckDate: Date,
    },
    hearing: {
      leftEar: {
        type: String,
        enum: Object.values(HEARING_STATUS),
      },
      rightEar: {
        type: String,
        enum: Object.values(HEARING_STATUS),
      },
      lastCheckDate: Date,
    },
    vaccinations: [
      {
        name: { type: String, required: true },
        date: { type: Date, required: true },
        nextDueDate: Date,
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const HealthProfile = mongoose.model("HealthProfile", healthProfileSchema);

module.exports = HealthProfile;
