const Plan = require("../models/plan.model");

class PlanRepository {
  findActivePlans() {
    return Plan.find({ isActive: true });
  }

  findById(id) {
    return Plan.findById(id);
  }
}

module.exports = new PlanRepository();
