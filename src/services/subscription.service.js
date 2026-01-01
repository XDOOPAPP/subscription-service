const planRepository = require("../repositories/plan.repository");
const subscriptionRepository = require("../repositories/subscription.repository");
const AppError = require("../utils/appError");
const STATUS = require("../constants/subscription-status");

class SubscriptionService {
  async getPlans() {
    return planRepository.findActivePlans();
  }

  async getCurrent(userId) {
    return subscriptionRepository.findActiveByUser(userId);
  }

  async subscribe(userId, planId) {
    if (!planId) {
      throw new AppError("planId is required", 400);
    }

    const plan = await planRepository.findById(planId);
    if (!plan || !plan.isActive) {
      throw new AppError("Plan not found or inactive", 404);
    }

    const activeSub = await subscriptionRepository.findActiveByUser(userId);
    if (activeSub) {
      throw new AppError("User already has an active subscription", 409);
    }

    const now = new Date();
    const endDate = this._calculateEndDate(now, plan.interval);

    return subscriptionRepository.create({
      userId,
      planId,
      status: STATUS.ACTIVE,
      startDate: now,
      endDate,
    });
  }

  async cancel(userId) {
    const activeSub = await subscriptionRepository.findActiveByUser(userId);
    if (!activeSub) {
      throw new AppError("No active subscription to cancel", 404);
    }

    await subscriptionRepository.expireActive(userId);
  }

  async getHistory(userId) {
    return subscriptionRepository.findAllByUser(userId);
  }

  async checkFeature(userId, feature) {
    if (!feature) return false;

    const activeSub = await subscriptionRepository.findActiveByUser(userId);
    if (!activeSub || !activeSub.planId) return false;

    return activeSub.planId.features.includes(feature);
  }

  async getPlanDetail(id) {
    const plan = await planRepository.findById(id);
    if (!plan || !plan.isActive) {
      throw new AppError("Plan not found", 404);
    }
    return plan;
  }

  async toggleAutoRenew(userId) {
    const sub = await subscriptionRepository.findActiveByUser(userId);
    if (!sub) throw new AppError("No active subscription", 404);

    sub.autoRenew = !sub.autoRenew;
    await sub.save();
    return sub;
  }

  async getUserFeatures(userId) {
    const sub = await subscriptionRepository.findActiveByUser(userId);
    if (!sub || !sub.planId) return [];
    return sub.planId.features;
  }

  async activateAfterPayment(payload) {
    const { userId, planId, paymentRef } = payload;

    const plan = await planRepository.findById(planId);
    if (!plan) throw new AppError("Invalid plan");

    await subscriptionRepository.expireActive(userId);

    const now = new Date();
    const endDate = this._calculateEndDate(now, plan.interval);

    return subscriptionRepository.create({
      userId,
      planId,
      status: STATUS.ACTIVE,
      startDate: now,
      endDate,
      paymentRef,
      autoRenew: true
    });
  }

  async createPlan(data) {
    return planRepository.create(data);
  }

  async updatePlan(id, data) {
    const plan = await planRepository.update(id, data);
    if (!plan) throw new AppError("Plan not found", 404);
    return plan;
  }


  // ================= PRIVATE METHODS =================

  _calculateEndDate(startDate, interval) {
    const end = new Date(startDate);

    switch (interval) {
      case "MONTHLY":
        end.setMonth(end.getMonth() + 1);
        break;

      case "YEARLY":
        end.setFullYear(end.getFullYear() + 1);
        break;

      case "LIFETIME":
        return null;

      default:
        throw new AppError("Invalid plan interval");
    }

    return end;
  }

}

module.exports = new SubscriptionService();
