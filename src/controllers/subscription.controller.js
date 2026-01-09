const SubscriptionService = require("../services/subscription.service");

class SubscriptionController {

  constructor(eventBus) {
    this.subscriptionService = new SubscriptionService(eventBus);
  }

  // [GET] /api/v1/subscriptions/plans
  getPlans = async (req, res) => {
    const plans = await this.subscriptionService.getPlans();
    res.json(plans);
  };

  // [GET] /api/v1/subscriptions/current
  getCurrent = async (req, res) => {
    const sub = await this.subscriptionService.getCurrent(req.user.userId);
    res.json(sub);
  };

  // [POST] /api/v1/subscriptions
  subscribe = async (req, res) => {
    const sub = await this.subscriptionService.subscribe(
      req.user.userId,
      req.body.planId
    );
    res.status(201).json(sub);
  };

  // [POST] /api/v1/subscriptions/cancel
  cancel = async (req, res) => {
    await this.subscriptionService.cancel(req.user.userId);
    res.json({ message: "Subscription cancelled" });
  };

  // [GET] /api/v1/subscriptions/history
  history = async (req, res) => {
    const data = await this.subscriptionService.getHistory(req.user.userId);
    res.json(data);
  };

  // [GET] /api/v1/subscriptions/check
  checkFeature = async (req, res) => {
    const { feature } = req.query;
    const allowed = await this.subscriptionService.checkFeature(
      req.user.userId,
      feature
    );
    res.json({ allowed });
  };

  // [GET] /api/v1/subscriptions/plans/:id
  getPlanDetail = async (req, res) => {
    const plan = await this.subscriptionService.getPlanDetail(req.params.id);
    res.json(plan);
  };

  // [POST] /api/v1/subscriptions/auto-renew
  toggleAutoRenew = async (req, res) => {
    const sub = await this.subscriptionService.toggleAutoRenew(req.user.userId);
    res.json(sub);
  };

  // [GET] /api/v1/subscriptions/features
  getUserFeatures = async (req, res) => {
    const features = await this.subscriptionService.getUserFeatures(req.user.userId);
    res.json(features);
  };

  // [POST] /api/v1/subscriptions/plans
  createPlan = async (req, res) => {
    const plan = await this.subscriptionService.createPlan(req.body);
    res.status(201).json(plan);
  };

  // [PATCH] /api/v1/subscriptions/plans/:id
  updatePlan = async (req, res) => {
    const plan = await this.subscriptionService.updatePlan(req.params.id, req.body);
    res.json(plan);
  };

  // [DELETE] /api/v1/subscriptions/plans/:id
  disablePlan = async (req, res) => {
    await this.subscriptionService.disablePlan(req.params.id);
    res.json({ message: "Plan disabled" });
  };

  // [GET] /api/v1/subscriptions/admin/stats
  getStats = async (req, res) => {
    const stats = await this.subscriptionService.getStats();
    res.json(stats);
  };

}

module.exports = SubscriptionController;
