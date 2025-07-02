const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentParentSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    relationship: {
      type: String,
      required: true,
    },
    is_emergency_contact: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved", // Default to approved for backward compatibility
    },
    notes: {
      type: String, // Additional information provided by parent during request
    },
    admin_notes: {
      type: String, // Notes added by admin/nurse during approval/rejection
    },
    processed_by: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to staff who processed the request
    },
    processed_at: {
      type: Date, // When the request was processed
    },
  },
  {
    timestamps: true,
  }
);

studentParentSchema.index({ student: 1, parent: 1 }, { unique: true });

const StudentParent = mongoose.model("StudentParent", studentParentSchema);

module.exports = StudentParent;
