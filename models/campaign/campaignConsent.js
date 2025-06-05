const mongoose = require("mongoose");
const { CAMPAIGN_CONSENT_STATUS } = require("../../utils/enums");
const Schema = mongoose.Schema;

const campaignConsentSchema = new Schema(
  {
    campaign: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    answered_by: {
      type: Schema.Types.ObjectId,
      ref: "Parent",
    },
    status: {
      type: String,
      enum: Object.values(CAMPAIGN_CONSENT_STATUS),
      default: CAMPAIGN_CONSENT_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

campaignConsentSchema.index({ campaign: 1, student: 1 }, { unique: true });

const CampaignConsent = mongoose.model(
  "CampaignConsent",
  campaignConsentSchema
);

module.exports = CampaignConsent;
