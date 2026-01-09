const planRepository = require("../repositories/plan.repository");
const subscriptionRepository = require("../repositories/subscription.repository");
const AppError = require("../utils/appError");
const STATUS = require("../constants/subscription-status");

class SubscriptionService {

  constructor(eventBus) {
    this.eventBus = eventBus;
    this._listenUserCreated();
    this._listenPaymentSuccess();
  }

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
      status: STATUS.PENDING,
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

  async createPlan(data) {
    if (data.isFree) {
      const existingFree = await planRepository.findFreePlan();
      if (existingFree) {
        throw new AppError("There is already an active Free plan", 400);
      }
    }
    const plan =  planRepository.create(data);

    await this.eventBus.publish("PLAN_CREATED", {
      planId: plan._id.toString(),
      name: plan.name,
      price: plan.price,
      interval: plan.interval,
      isActive: plan.isActive,
      isFree: plan.isFree
    });

    return plan;
  }

  async updatePlan(id, data) {
    const plan = await planRepository.findById(id);
    if (!plan) throw new AppError("Plan not found", 404);

    if (plan.isFree && ("isFree" in data || ("isActive" in data && data.isActive === false))) {
      throw new AppError("Free plan cannot be modified or disabled", 400);
    }
    
    const updated = await planRepository.update(id, data);

    await this.eventBus.publish("PLAN_UPDATED", {
      planId: plan._id.toString(),
      name: plan.name,
      price: plan.price,
      interval: plan.interval,
      isActive: plan.isActive,
      isFree: plan.isFree
    });

    return updated;
  }

  async disablePlan(id) {
    await planRepository.update(id, { isActive: false });
  }

  async getStats() {
    return subscriptionRepository.aggregateStats();
  }

  // ================= PRIVATE METHODS =================

  async _listenUserCreated() {
    if (!this.eventBus) return;

    await this.eventBus.subscribe("USER_CREATED", async (payload) => {
      try {
        const userId = payload.userId;

        const activeSub = await subscriptionRepository.findActiveByUser(userId);
        if (activeSub) return;


        const freePlan = await planRepository.findFreePlan(); 
        if (!freePlan) return;

        const now = new Date();
        const endDate = this._calculateEndDate(now, freePlan.interval);

        await subscriptionRepository.create({
          userId,
          planId: freePlan._id,
          status: STATUS.ACTIVE,
          startDate: now,
          endDate,
        });

        console.log("✅ Free subscription created for", userId);
      } catch (err) {
        console.error("Error creating free subscription:", err.message);
      }
    });
  }

  async _listenPaymentSuccess() {
    await this.eventBus.subscribe("PAYMENT_SUCCESS", async (payload) => {
      const { userId, paymentRef } = payload;

      const sub = await subscriptionRepository.findActiveByUser(userId);
      if (!sub || sub.status !== STATUS.PENDING) return;

      await sub.populate("planId");

      sub.status = STATUS.ACTIVE;
      sub.paymentRef = paymentRef;
      sub.startDate = new Date();
      sub.endDate = this._calculateEndDate(sub.startDate, sub.planId.interval);

      await sub.save();
    });
  }

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

module.exports = SubscriptionService;
