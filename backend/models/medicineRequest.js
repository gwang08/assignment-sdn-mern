const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const medicineRequestSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return value >= new Date();
        },
        message: "Start date cannot be in the past",
      },
      required: true,
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return value >= new Date() && value > this.startDate;
        },
        message: "End date cannot be in the past and must be after startDate",
      },
      required: true,
    },
    medicines: [
      {
        _id: false,
        name: {
          type: String,
          required: true,
        },
        dosage: {
          type: String,
          required: true,
        },
        frequency: {
          type: String,
          required: true,
        },
        notes: {
          type: String,
          default: "",
        },
      },
    ],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
    approved_by: {
      type: String,
    },
    approved_at: {
      type: Date,
    },
  },
  { timestamps: true }
);

const MedicineRequest = mongoose.model("MedicineRequest", medicineRequestSchema);
module.exports = MedicineRequest;
