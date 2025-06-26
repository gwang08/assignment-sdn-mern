const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const personSchema = require("../interfaces/person");

const studentSchema = new Schema(
  {
    ...personSchema.obj,
    username: {
      type: String,
      unique: true,
      sparse: true, // Allows null values and only enforces uniqueness for non-null values
      trim: true,
    },
    password: {
      type: String,
    },
    student_id: {
      type: String,
      unique: true,
      sparse: true,
    },
    class_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
