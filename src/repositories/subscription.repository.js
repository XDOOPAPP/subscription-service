const Subscription = require("../models/subscription.model");

class SubscriptionRepository {
  findActiveByUser(userId) {
    return Subscription.findOne({
      userId,
      status: "ACTIVE"
    }).populate("planId");
  }

  findAllByUser(userId) {
    return Subscription.find({ userId }).sort({ startDate: -1 }).populate("planId");
  }

  cancelActive(userId) {
    return Subscription.updateMany(
      { userId, status: "ACTIVE" },
      { status: "CANCELLED" }
    );
  }

  create(data) {
    return Subscription.create(data);
  }

  aggregateStats() {
    return Subscription.aggregate([
      { $group: { _id: "$status", total: { $sum: 1 } } }
    ]);
  }

  findFilter(filter) {
    return Subscription.find(filter);
  }
}

module.exports = new SubscriptionRepository();
