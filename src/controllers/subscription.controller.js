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

  // [GET] /api/v1/subscriptions/history
  history = async (req, res) => {
    const data = await subscriptionService.getHistory(req.user.userId);
    res.json(data);
  };

  // [GET] /api/v1/subscriptions/check
  checkFeature = async (req, res) => {
    const { feature } = req.query;
    const allowed = await subscriptionService.checkFeature(
      req.user.userId,
      feature
    );
    res.json({ allowed });
  };

  // [GET] /api/v1/subscriptions/plans/:id
  getPlanDetail = async (req, res) => {
    const plan = await subscriptionService.getPlanDetail(req.params.id);
    res.json(plan);
  };

  // [POST] /api/v1/subscriptions/auto-renew
  toggleAutoRenew = async (req, res) => {
    const sub = await subscriptionService.toggleAutoRenew(req.user.userId);
    res.json(sub);
  };

  // [GET] /api/v1/subscriptions/features
  getUserFeatures = async (req, res) => {
    const features = await subscriptionService.getUserFeatures(req.user.userId);
    res.json(features);
  };

  // [POST] /api/v1/subscriptions/payment/success
  paymentSuccess = async (req, res) => {
    // req.body = {
    //   "userId": "user_005",
    //   "planId": "6951600b0f1ca05fb93cbfe7",
    //   "paymentRef": "MOCK_PAYMENT_001"
    // }
    await subscriptionService.activateAfterPayment(req.body);
    res.json({ success: true });
  };

  // [POST] /api/v1/subscriptions/plans
  createPlan = async (req, res) => {
    const plan = await subscriptionService.createPlan(req.body);
    res.status(201).json(plan);
  };

  // [PATCH] /api/v1/subscriptions/plans/:id
  updatePlan = async (req, res) => {
    const plan = await subscriptionService.updatePlan(req.params.id, req.body);
    res.json(plan);
  };


}

module.exports = new SubscriptionController();
