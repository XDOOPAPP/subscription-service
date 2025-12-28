const planRepository = require("../repositories/plan.repository");
const subscriptionRepository = require("../repositories/subscription.repository");

class SubscriptionService {
  async getPlans() {
    return planRepository.findActivePlans();
  }

  async getCurrent(userId) {
    return subscriptionRepository.findActiveByUser(userId);
  }
}

module.exports = new SubscriptionService();
