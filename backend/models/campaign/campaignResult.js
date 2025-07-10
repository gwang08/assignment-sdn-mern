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
      ref: "User",
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
    vaccination_details: {
      vaccinated_at: {
        type: Date,
      },
      vaccine_details: {
        brand: String,
        batch_number: String,
        dose_number: {
          type: Number,
          min: 1,
          max: 10
        },
        expiry_date: Date
      },
      administered_by: String,
      side_effects: [
        {
          type: String,
          enum: [
            "pain",
            "swelling",
            "fever",
            "headache",
            "fatigue",
            "nausea",
            "dizziness",
            "other",
          ],
        },
      ],
      follow_up_required: {
        type: Boolean,
        default: false,
      },
      follow_up_date: Date,
      follow_up_notes: String,
      additional_actions: [
        {
          type: String,
          enum: [
            "medication",
            "rest",
            "hospital_referral",
            "parent_contact",
            "continue_monitoring",
            "other",
          ],
        },
      ],
      status: {
        type: String,
        enum: [
          "completed",
          "follow_up_needed",
          "normal",
          "mild_reaction",
          "moderate_reaction",
          "severe_reaction",
        ],
        default: "completed",
      },
      last_follow_up: Date,
    },
  },
  {
    timestamps: true,
  }
);

const CampaignResult = mongoose.model("CampaignResult", campaignResultSchema);

module.exports = CampaignResult