const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { EVENT_TYPE, EVENT_SEVERITY, EVENT_STATUS } = require("../utils/enums");

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
    event_type: {
      type: String,
      enum: Object.values(EVENT_TYPE),
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: Object.values(EVENT_SEVERITY),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(EVENT_STATUS),
      default: EVENT_STATUS.OPEN,
    },
    symptoms: [String],
    occurred_at: {
      type: Date,
      default: Date.now,
    },
    resolved_at: Date,
    treatment_notes: String,
    medications_administered: [
      {
        name: String,
        dosage: String,
        time: Date,
        administered_by: {
          type: Schema.Types.ObjectId,
          ref: "MedicalStaff",
        },
      },
    ],
    parent_notified: {
      status: {
        type: Boolean,
        default: false,
      },
      time: Date,
      method: String,
    },
    follow_up_required: {
      type: Boolean,
      default: false,
    },
    follow_up_notes: String,
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient queries
medicalEventSchema.index({ student: 1, status: 1 });
medicalEventSchema.index({ created_by: 1 });
medicalEventSchema.index({ occurred_at: -1 });

const MedicalEvent = mongoose.model("MedicalEvent", medicalEventSchema);

module.exports = MedicalEvent;
