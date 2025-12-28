const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    interval: {
      type: String,
      enum: ["MONTHLY", "YEARLY", "LIFETIME"]
    },
    features: [String],
    isFree: Boolean,
    isActive: Boolean
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);