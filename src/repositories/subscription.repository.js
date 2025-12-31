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

  expireActive(userId) {
    return Subscription.updateMany(
      { userId, status: "ACTIVE" },
      { status: "EXPIRED" }
    );
  }

  create(data) {
    return Subscription.create(data);
  }
}

module.exports = new SubscriptionRepository();
