const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const controller = require("../controllers/subscription.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/plans", asyncHandler(controller.getPlans));

router.get("/current", auth, asyncHandler(controller.getCurrent));

router.post("/", auth, asyncHandler(controller.subscribe));

router.post('/cancel', auth, asyncHandler(controller.cancel));

router.get('/history', auth, asyncHandler(controller.history));

router.get("/check", auth, asyncHandler(controller.checkFeature));

router.get("/plans/:id", asyncHandler(controller.getPlanDetail));

router.post("/auto-renew", auth, asyncHandler(controller.toggleAutoRenew));


module.exports = router;