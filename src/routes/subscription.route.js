const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const Subscontroller = require("../controllers/subscription.controller");
const auth = require("../middlewares/auth.middleware");


module.exports = (app) => {
  const bus = app.get("eventBus");
  const controller = new Subscontroller(bus)

  router.get("/plans", asyncHandler(controller.getPlans));

  router.get("/current", auth, asyncHandler(controller.getCurrent));

  router.get("/internal/user-features/:userId", asyncHandler(controller.getUserFeatures));

  router.post("/", auth, asyncHandler(controller.subscribe));

  router.post('/cancel', auth, asyncHandler(controller.cancel));

  router.get('/history', auth, asyncHandler(controller.history));

  router.get("/plans/:id", asyncHandler(controller.getPlanDetail));

  router.post("/plans", auth, asyncHandler(controller.createPlan));

  router.patch("/plans/:id", auth, asyncHandler(controller.updatePlan));

  router.delete("/plans/:id", auth, asyncHandler(controller.disablePlan));

  router.get("/admin/stats", auth, asyncHandler(controller.getStats));

  // Revenue Statistics Routes
  router.get("/stats/revenue-over-time", auth, asyncHandler(controller.getRevenueOverTime));

  router.get("/stats/total-revenue", auth, asyncHandler(controller.getTotalRevenueStats));

  router.get("/stats/revenue-by-plan", auth, asyncHandler(controller.getRevenueByPlan));

  router.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      service: "subscription-service"
    });
  });


  return router;
}