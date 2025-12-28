const subscriptionService = require("../services/subscription.service");

class SubscriptionController {
  // [GET] /api/v1/subscriptions/plans
  getPlans = async (req, res) => {
    const plans = await subscriptionService.getPlans();
    res.json(plans);
  };

  // [GET] /api/v1/subscriptions/current
  getCurrent = async (req, res) => {
    // req.user = { userId: "user_001" };
    const sub = await subscriptionService.getCurrent(req.user.userId);
    res.json(sub);
  };


}

module.exports = new SubscriptionController();
