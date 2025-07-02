const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { CAMPAIGN_TYPE } = require("../../utils/enums");

const vaccineDetailsSchema = new Schema(
  {
    brand: { type: String, required: true },
    batchNumber: { type: String, required: true },
    dosage: { type: String, required: true },
  },
  { _id: false }
);

const campaignSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    campaign_type: {
      type: String,
      enum: ['vaccination', 'health_check', 'screening', 'other'],
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(CAMPAIGN_TYPE),
      required: true,
    },
    vaccineDetails: {
      type: vaccineDetailsSchema,
      required: function () {
        return this.type === CAMPAIGN_TYPE.VACCINATION;
      },
    },
    description: {
      type: String,
    },
    target_classes: [{
      type: String,
    }],
    target_students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'cancelled'],
      default: 'draft',
    },
    requires_consent: {
      type: Boolean,
      default: false,
    },
    consent_deadline: {
      type: Date,
    },
    instructions: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Campaign", campaignSchema);
