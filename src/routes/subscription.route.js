const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const Subscontroller = require("../controllers/subscription.controller");
const auth = require("../middlewares/auth.middleware");


module.exports = (app) => {
  const bus = app.get("eventBus"); 
  const controller = new Subscontroller(bus)
    
  router.get("/plans", asyncHandler(controller.getPlans));

  router.get("/current", auth, asyncHandler(controller.getCurrent));

  router.post("/", auth, asyncHandler(controller.subscribe));

  router.post('/cancel', auth, asyncHandler(controller.cancel));

  router.get('/history', auth, asyncHandler(controller.history));

  router.get("/check", auth, asyncHandler(controller.checkFeature));

  router.get("/plans/:id", asyncHandler(controller.getPlanDetail));

  router.post("/auto-renew", auth, asyncHandler(controller.toggleAutoRenew));

  router.get("/features", auth, asyncHandler(controller.getUserFeatures));

  router.post("/payment/success", asyncHandler(controller.paymentSuccess));

  router.post("/plans", auth, asyncHandler(controller.createPlan));

  router.patch("/plans/:id", auth, asyncHandler(controller.updatePlan));

  router.delete("/plans/:id", auth, asyncHandler(controller.disablePlan));

  router.get("/admin/stats", auth, asyncHandler(controller.getStats));

  router.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      service: "subscription-service"
    });
  });


  return router;
}