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

  cancelActive(userId) {
    return Subscription.updateMany(
      { userId, status: "ACTIVE" },
      { status: "CANCELLED" }
    );
  }

  create(data) {
    return Subscription.create(data);
  }

  aggregateStats() {
    return Subscription.aggregate([
      { $group: { _id: "$planId", total: { $sum: 1 } } }
    ]);
  }

  findFilter(filter) {
    return Subscription.find(filter);
  }

  async getRevenueOverTime(period = 'daily', days = 30) {
    // Validate input
    const allowedPeriods = ['daily', 'weekly', 'monthly'];
    if (!allowedPeriods.includes(period)) period = 'daily';

    days = Number(days);
    if (isNaN(days) || days <= 0) days = 30;

    const now = new Date(); // UTC
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const timezone = 'Asia/Ho_Chi_Minh';

    let groupId;
    let sortStage = {};

    switch (period) {
      case 'daily':
        groupId = {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt',
            timezone
          }
        };
        sortStage = { _id: 1 };
        break;

      case 'weekly':
        groupId = {
          year: { $isoWeekYear: '$createdAt' },
          week: { $isoWeek: '$createdAt' }
        };
        sortStage = { '_id.year': 1, '_id.week': 1 };
        break;

      case 'monthly':
        groupId = {
          $dateToString: {
            format: '%Y-%m',
            date: '$createdAt',
            timezone
          }
        };
        sortStage = { _id: 1 };
        break;

      default:
        groupId = {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt',
            timezone
          }
        };
        sortStage = { _id: 1 };
    }

    const result = await Subscription.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now },
          status: { $in: ['ACTIVE', 'CANCELLED', 'EXPIRED'] }
        }
      },
      {
        $lookup: {
          from: 'plans',
          localField: 'planId',
          foreignField: '_id',
          as: 'plan'
        }
      },
      { $unwind: '$plan' },
      {
        $group: {
          _id: groupId,
          totalRevenue: { $sum: '$plan.price' },
          subscriptionCount: { $sum: 1 }
        }
      },
      { $sort: sortStage }
    ]);

    // Format output
    return result.map(item => {
      if (period === 'weekly') {
        return {
          period: `${item._id.year}-W${item._id.week}`,
          totalRevenue: item.totalRevenue,
          subscriptionCount: item.subscriptionCount
        };
      }

      return {
        period: item._id,
        totalRevenue: item.totalRevenue,
        subscriptionCount: item.subscriptionCount
      };
    });
  }

  async getTotalRevenueStats() {
    const result = await Subscription.aggregate([
      {
        $match: {
          status: { $in: ['ACTIVE', 'CANCELLED', 'EXPIRED'] }
        }
      },
      {
        $lookup: {
          from: 'plans',
          localField: 'planId',
          foreignField: '_id',
          as: 'plan'
        }
      },
      {
        $unwind: '$plan'
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$plan.price' },
          activeSubscriptions: {
            $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } // if status == ACTIVE then 1 else 0
          },
          cancelledSubscriptions: {
            $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] }
          },
          totalSubscriptions: { $sum: 1 }
        }
      }
    ]);

    return result[0] || { 
      totalRevenue: 0, 
      activeSubscriptions: 0, 
      cancelledSubscriptions: 0, 
      totalSubscriptions: 0 
    };
  }

  async getRevenueByPlan() {
    const result = await Subscription.aggregate([
      {
        $match: {
          status: { $in: ['ACTIVE', 'CANCELLED', 'EXPIRED'] }
        }
      },
      {
        $lookup: {
          from: 'plans',
          localField: 'planId',
          foreignField: '_id',
          as: 'plan'
        }
      },
      {
        $unwind: '$plan'
      },
      {
        $group: {
          _id: { planId: '$planId', planName: '$plan.name' },
          totalRevenue: { $sum: '$plan.price' },
          subscriptionCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]);

    return result;
  }
}

module.exports = new SubscriptionRepository();
