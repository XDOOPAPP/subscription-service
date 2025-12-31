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
    const sub = await subscriptionService.subscribe(
      req.user.userId,
      req.body.planId
    );
    res.status(201).json(sub);
  };

  // [POST] /api/v1/subscriptions/cancel
  cancel = async (req, res) => {
    await subscriptionService.cancel(req.user.userId);
    res.json({ message: "Subscription cancelled" });
  };


}

module.exports = new SubscriptionController();
