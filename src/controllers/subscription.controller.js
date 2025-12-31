const subscriptionService = require("../services/subscription.service");

class SubscriptionController {
  // [GET] /api/v1/subscriptions/plans
  getPlans = async (req, res) => {
    const plans = await subscriptionService.getPlans();
    res.json(plans);
  };

  // [GET] /api/v1/subscriptions/current
  getCurrent = async (req, res) => {
    const sub = await subscriptionService.getCurrent(req.user.userId);
    res.json(sub);
  };

  // [POST] /api/v1/subscriptions
  subscribe = async (req, res) => {
    const userId = "user_005";
    const planId = "6951600b0f1ca05fb93cbfe7" 
    const sub = await subscriptionService.subscribe(
      userId,
      planId
    );
    res.status(201).json(sub);
  };


}

module.exports = new SubscriptionController();
