const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const campaignResultSchema = new Schema(
  {
    campaign: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "MedicalStaff",
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    notes: {
      type: String,
    },
    checkupDetails: {
      findings: String,
      recommendations: String,
      status: {
        type: String,
        enum: ["HEALTHY", "NEEDS_ATTENTION", "CRITICAL"],
        default: "HEALTHY",
      },
      requiresConsultation: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

const CampaignResult = mongoose.model("CampaignResult", campaignResultSchema);

module.exports = CampaignResult;
