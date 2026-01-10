const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: String,
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan"
    },
    status: {
      type: String,
      enum: ["ACTIVE", "CANCELLED", "EXPIRED", "PENDING"]
    },
    startDate: Date,
    endDate: Date,
    cancelledAt: Date,
    paymentRef: String
  },
  { timestamps: true }
);

subscriptionSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("Subscription", subscriptionSchema);