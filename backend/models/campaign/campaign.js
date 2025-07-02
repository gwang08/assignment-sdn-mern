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
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Campaign", campaignSchema);
