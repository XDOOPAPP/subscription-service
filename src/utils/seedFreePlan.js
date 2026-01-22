const planRepository = require("../repositories/plan.repository");

const seedFreePlan = async () => {
  try {
    // Check if free plan already exists
    const existingFreePlan = await planRepository.findFreePlan();
    
    if (existingFreePlan) {
      console.log("✅ Free plan already exists:", existingFreePlan.name);
      return existingFreePlan;
    }

    // Create free plan
    const freePlan = await planRepository.create({
      name: "Free",
      price: 0,
      interval: "LIFETIME",
      features: {
        OCR: false,
        AI: false
      },
      isFree: true,
      isActive: true
    });

    console.log("✅ Free plan created successfully:", freePlan.name);
    return freePlan;
  } catch (error) {
    console.error("❌ Error seeding free plan:", error.message);
    throw error;
  }
};

module.exports = seedFreePlan;
