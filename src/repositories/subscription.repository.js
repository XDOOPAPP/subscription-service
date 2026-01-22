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
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    let groupFormat;
    if (period === 'daily') {
      groupFormat = { 
        $dateToString: 
        { 
          format: '%Y-%m-%d', 
          date: '$createdAt' 
        } 
      };
    } else if (period === 'weekly') {
      groupFormat = { 
        $week: '$createdAt', 
        $year: '$createdAt' 
      };
    } else if (period === 'monthly') {
      groupFormat = { 
        $dateToString: { 
          format: '%Y-%m', 
          date: '$createdAt' 
        } 
      };
    } else {
      groupFormat = { 
        $dateToString: { 
          format: '%Y-%m-%d', 
          date: '$createdAt' 
        } 
      };
    }

    const result = await Subscription.aggregate([
      {
        $match: { // filter by createdAt and status
          createdAt: { $gte: startDate, $lte: now },
          status: { $in: ['ACTIVE', 'CANCELLED', 'EXPIRED'] }
        }
      },
      {
        $lookup: { // join with plans collection
          from: 'plans',
          localField: 'planId',
          foreignField: '_id',
          as: 'plan'
        }
      },
      {
        $unwind: '$plan' // chose object inbtead of array
      },
      {
        $group: {
          _id: groupFormat,
          totalRevenue: { $sum: '$plan.price' },
          subscriptionCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return result;
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
