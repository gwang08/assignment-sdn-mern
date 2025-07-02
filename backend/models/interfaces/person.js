const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { GENDER } = require("../../utils/enums");

const personSchema = new Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: Object.values(GENDER),
      required: true,
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      street: String,
      city: String,
      state: String,
      postal_code: String,
      country: String,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
    timestamps: true,
  }
);

module.exports = personSchema;
