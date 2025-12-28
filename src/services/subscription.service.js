const planRepo = require("../repositories/plan.repository");

class SubscriptionService {
  getPlans() {
    return planRepo.findActivePlans();
  }

}

module.exports = new SubscriptionService();
