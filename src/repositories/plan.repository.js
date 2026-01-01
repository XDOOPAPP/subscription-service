const Plan = require("../models/plan.model");

class PlanRepository {
  findActivePlans() {
    return Plan.find({ isActive: true });
  }

  findById(id) {
    return Plan.findById(id);
  }

  create(data) {
    return Plan.create(data);
  }

  update(id, data) {
    return Plan.findByIdAndUpdate(id, data, { new: true });
  }
  
}

module.exports = new PlanRepository();
