const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentParentSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Parent",
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
  },
  {
    timestamps: true,
  }
);

studentParentSchema.index({ student: 1, parent: 1 }, { unique: true });

const StudentParent = mongoose.model("StudentParent", studentParentSchema);

module.exports = StudentParent;
