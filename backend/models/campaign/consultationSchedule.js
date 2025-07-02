const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { CONSULTATION_STATUS } = require("../../utils/enums");

const consultationScheduleSchema = new Schema(
  {
    campaignResult: {
      type: Schema.Types.ObjectId,
      ref: "CampaignResult",
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    medicalStaff: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attending_parent: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (value) {
          if (!this.student) return false;
          const studentParent = await mongoose.model("StudentParent").findOne({
            student: this.student,
            parent: value,
            is_active: true,
          });
          return !!studentParent;
        },
        message: "Parent must be related to the student",
      },
    },
    scheduledDate: {
      type: Date,
      required: true,
      validate: {
        validator: async function (value) {
          // Check if date is in future
          if (value <= new Date()) {
            throw new Error("Scheduled date must be in the future");
          }

          // Check for overlapping consultations with same medical staff
          const overlapping = await mongoose
            .model("ConsultationSchedule")
            .findOne({
              medicalStaff: this.medicalStaff,
              _id: { $ne: this._id }, // Exclude current document when updating
              status: CONSULTATION_STATUS.SCHEDULED,
              scheduledDate: {
                $lt: new Date(value.getTime() + this.duration * 60000), // Convert duration to milliseconds
                $gt: value,
              },
            });

          if (overlapping) {
            throw new Error(
              "This time slot overlaps with another consultation"
            );
          }

          return true;
        },
        message: "Invalid scheduled date",
      },
    },
    duration: {
      type: Number,
      required: true,
      min: [15, "Consultation must be at least 15 minutes"],
      max: [120, "Consultation cannot exceed 2 hours"],
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(CONSULTATION_STATUS),
      default: CONSULTATION_STATUS.SCHEDULED,
    },
    notificationsSent: {
      type: Boolean,
      default: false,
    },
    notes: String,
    cancelReason: String,
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient queries
consultationScheduleSchema.index({ scheduledDate: 1, medicalStaff: 1 });
consultationScheduleSchema.index({ student: 1, status: 1 });
consultationScheduleSchema.index({ attending_parent: 1, status: 1 });

const ConsultationSchedule = mongoose.model(
  "ConsultationSchedule",
  consultationScheduleSchema
);

module.exports = ConsultationSchedule;
