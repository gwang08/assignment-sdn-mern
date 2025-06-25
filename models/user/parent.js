const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const personSchema = require("../interfaces/person");

const parentSchema = new Schema(
  {
    ...personSchema.obj,
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Parent = mongoose.model("Parent", parentSchema);

module.exports = Parent;
