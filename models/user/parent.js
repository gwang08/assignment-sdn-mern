const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const personSchema = require("../interfaces/person");

const parentSchema = new Schema(
  {
    ...personSchema.obj,
    phone_number: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
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

const Parent = mongoose.model("Parent", parentSchema);

module.exports = Parent;
